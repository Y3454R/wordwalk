"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import wordsData from "../data/words.json";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

// Simple helper to sleep between utterances for a natural pause
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Map speech rate labels to numeric values for Web Speech API
const RATE_MAP = {
  slow: 0.8,
  medium: 1,
  fast: 1.25,
};

export default function WordPlayer() {
  const [groupId, setGroupId] = useState(wordsData.groups[0]?.id ?? 1);
  const [rate, setRate] = useState("medium");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keep stable refs for control across async flow
  const isStoppedRef = useRef(false);
  const isPausedRef = useRef(false);
  const indexRef = useRef(0);
  const runIdRef = useRef(0); // increments to invalidate prior loops

  const currentGroup = useMemo(() => {
    return wordsData.groups.find((g) => g.id === groupId);
  }, [groupId]);

  const total = currentGroup?.words?.length ?? 0;
  const current = currentGroup?.words?.[currentIndex];

  // Core TTS play routine: reads word, synonym, sentence, then advances
  const speakText = useCallback(
    (text) => {
      return new Promise((resolve) => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = RATE_MAP[rate];
        utter.onend = resolve;
        utter.onerror = resolve;
        window.speechSynthesis.speak(utter);
      });
    },
    [rate]
  );

  const playCurrent = useCallback(
    async (runId) => {
      const items = currentGroup?.words || [];
      if (!items.length) return;

      // This loop continues until stopped or we finish the list
      for (let i = indexRef.current; i < items.length; i++) {
        if (runIdRef.current !== runId) return; // another play session superseded
        indexRef.current = i;
        setCurrentIndex(i);
        const w = items[i];

        // If paused, wait here until resumed or stopped
        while (isPausedRef.current && !isStoppedRef.current) {
          if (runIdRef.current !== runId) return;
          await sleep(100);
        }
        if (isStoppedRef.current) break;

        // Speak word, synonym, and sentence sequentially
        // Comments: Each field is a separate utterance for clearer pacing
        await speakText(w.word);
        if (runIdRef.current !== runId) return;
        await sleep(200);
        if (runIdRef.current !== runId) return;
        await speakText(`synonym: ${w.synonym}`);
        if (runIdRef.current !== runId) return;
        await sleep(200);
        if (runIdRef.current !== runId) return;
        await speakText(w.sentence);

        if (isStoppedRef.current) break;
        // Small pause between words (1–2 seconds)
        await sleep(1200);
      }
      setIsPlaying(false);
    },
    [currentGroup?.words, speakText]
  );

  // Start playing from current index
  const handlePlay = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("SpeechSynthesis is not supported in this browser.");
      return;
    }
    if (isPlaying) return;
    isStoppedRef.current = false;
    isPausedRef.current = false;
    setIsPlaying(true);
    const newRunId = runIdRef.current + 1;
    runIdRef.current = newRunId;
    playCurrent(newRunId);
  }, [isPlaying, playCurrent]);

  const handlePause = useCallback(() => {
    isPausedRef.current = true;
    window.speechSynthesis.pause();
    setIsPlaying(false);
  }, []);

  const handleResume = useCallback(() => {
    if (!isPausedRef.current) return;
    isPausedRef.current = false;
    window.speechSynthesis.resume();
    setIsPlaying(true);
    // Do not start a new loop; the existing loop will continue.
  }, []);

  const handleStop = useCallback(() => {
    isStoppedRef.current = true;
    isPausedRef.current = false;
    runIdRef.current += 1; // invalidate any running loop
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const handleRestart = useCallback(() => {
    // Stop any current playback and reset to the start
    isStoppedRef.current = true;
    isPausedRef.current = false;
    window.speechSynthesis.cancel();
    indexRef.current = 0;
    setCurrentIndex(0);
    // Start a fresh session from the beginning
    const newRunId = runIdRef.current + 1;
    runIdRef.current = newRunId;
    setIsPlaying(true);
    isStoppedRef.current = false;
    playCurrent(newRunId);
  }, [playCurrent]);

  const handlePrev = useCallback(() => {
    const prev = Math.max(0, indexRef.current - 1);
    indexRef.current = prev;
    setCurrentIndex(prev);
    // Cancel current and restart immediately if currently playing
    if (isPlaying) {
      window.speechSynthesis.cancel();
      isPausedRef.current = false;
      isStoppedRef.current = false;
      const newRunId = runIdRef.current + 1;
      runIdRef.current = newRunId;
      playCurrent(newRunId);
    }
  }, [isPlaying, playCurrent]);

  const handleNext = useCallback(() => {
    const items = currentGroup?.words || [];
    const next = Math.min(items.length - 1, indexRef.current + 1);
    indexRef.current = next;
    setCurrentIndex(next);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      isPausedRef.current = false;
      isStoppedRef.current = false;
      const newRunId = runIdRef.current + 1;
      runIdRef.current = newRunId;
      playCurrent(newRunId);
    }
  }, [currentGroup?.words, isPlaying, playCurrent]);

  // Reset state when group changes
  useEffect(() => {
    indexRef.current = 0;
    setCurrentIndex(0);
    handleStop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    };
  }, []);

  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>WordWalk</CardTitle>
          <div className="flex gap-2">
            <select
              aria-label="Select word group"
              className="h-10 rounded-md border bg-transparent px-3"
              value={groupId}
              onChange={(e) => setGroupId(Number(e.target.value))}
            >
              {wordsData.groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Speech rate"
              className="h-10 rounded-md border bg-transparent px-3"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            >
              <option value="slow">Slow</option>
              <option value="medium">Medium</option>
              <option value="fast">Fast</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              Word {Math.min(currentIndex + 1, total)} of {total}
            </div>
            <Progress value={progress} />
          </div>

          <div className="space-y-2 rounded-md border p-4">
            <div className="text-xs uppercase text-muted-foreground">Word</div>
            <div className="text-2xl font-semibold">{current?.word ?? "—"}</div>
            <div className="text-xs uppercase text-muted-foreground pt-3">
              Synonym
            </div>
            <div className="text-lg">{current?.synonym ?? "—"}</div>
            <div className="text-xs uppercase text-muted-foreground pt-3">
              Sentence
            </div>
            <div className="text-base">{current?.sentence ?? "—"}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isPlaying && !isPausedRef.current && (
              <Button onClick={handlePlay}>Play</Button>
            )}
            {isPausedRef.current && (
              <Button onClick={handleResume}>Resume</Button>
            )}
            {isPlaying && (
              <Button variant="secondary" onClick={handlePause}>
                Pause
              </Button>
            )}
            <Button variant="outline" onClick={handleRestart}>
              Start Over
            </Button>
            <Button variant="ghost" onClick={handleStop}>
              Stop
            </Button>
            <Button variant="outline" onClick={handlePrev}>
              Prev
            </Button>
            <Button variant="outline" onClick={handleNext}>
              Next
            </Button>
          </div>

          {/* Notes for readers:
            - TTS: Uses browser SpeechSynthesis with separate utterances for word, synonym, and sentence.
            - Auto-advance: Async loop increments index and speaks entries until stopped; small sleeps create pauses.
            - Theme switching: Tailwind 'class' strategy toggled via ThemeProvider, persisted in localStorage.
          */}
        </CardContent>
      </Card>
    </div>
  );
}
