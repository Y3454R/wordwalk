"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import wordsData from "../data/words.json";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { clsx } from "clsx";

function PlayIcon(props) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon(props) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

function StopIcon(props) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

function RestartIcon(props) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-9-9" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function PrevIcon(props) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function NextIcon(props) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

// Simple helper to sleep between utterances for a natural pause
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Map speech rate labels to numeric values for Web Speech API
const RATE_MAP = {
  slow: 0.8,
  medium: 1,
  fast: 1.25,
  max: 1.5,
};

export default function WordPlayer() {
  const [groupId, setGroupId] = useState(wordsData.groups[0]?.id ?? 1);
  const [rate, setRate] = useState("medium");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviseMode, setReviseMode] = useState(false);
  const [isRevealingSynonym, setIsRevealingSynonym] = useState(false);

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
        await sleep(reviseMode ? 1000 : 200);
        if (runIdRef.current !== runId) return;
        if (reviseMode) setIsRevealingSynonym(true);
        await speakText(`synonym: ${w.synonym}`);
        if (reviseMode) setIsRevealingSynonym(false);
        if (runIdRef.current !== runId) return;
        if (!reviseMode) {
          await sleep(200);
          if (runIdRef.current !== runId) return;
          await speakText(w.sentence);
        }

        if (isStoppedRef.current) break;
        // Small pause between words (1–2 seconds)
        await sleep(1200);
      }
      setIsPlaying(false);
    },
    [currentGroup?.words, speakText, reviseMode]
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

  // Reset to the beginning and stop playback
  const resetToStart = useCallback(() => {
    isStoppedRef.current = true;
    isPausedRef.current = false;
    runIdRef.current += 1;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    indexRef.current = 0;
    setCurrentIndex(0);
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

  // Keyboard shortcuts for prev/next
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlePrev, handleNext]);

  // Reset state when group changes
  useEffect(() => {
    indexRef.current = 0;
    setCurrentIndex(0);
    handleStop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // Reset when mode or rate changes
  useEffect(() => {
    resetToStart();
  }, [reviseMode, rate, resetToStart]);

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
        <CardHeader className="flex flex-col items-center gap-2">
          {/* <CardTitle>WordWalk</CardTitle> */}
          <div className="flex w-full flex-wrap justify-center gap-2">
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
              <option value="max">Max</option>
            </select>
          </div>
          <div className="flex w-full items-center justify-center gap-3">
            <span
              className={clsx(
                "text-xs font-medium",
                !reviseMode ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Normal
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={reviseMode}
              onClick={() => setReviseMode((v) => !v)}
              title={reviseMode ? "Mode: revise" : "Mode: normal"}
              className={clsx(
                "relative h-8 w-20 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                reviseMode ? "bg-primary/20" : "bg-muted"
              )}
            >
              <span
                className={clsx(
                  "absolute top-1 left-1 h-6 w-6 rounded-full bg-primary transition-transform",
                  reviseMode && "translate-x-12"
                )}
              />
              <span className="sr-only">Toggle revise mode</span>
            </button>
            <span
              className={clsx(
                "text-xs font-medium",
                reviseMode ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Revise
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              Word {Math.min(currentIndex + 1, total)} of {total}
            </div>
            <Progress value={progress} />
          </div>

          <div className="space-y-2 rounded-md border p-4 h-60 overflow-y-auto">
            <div className="text-xs uppercase text-muted-foreground">Word</div>
            <div className="text-2xl font-semibold">{current?.word ?? "—"}</div>
            <div className="text-xs uppercase text-muted-foreground pt-3">
              Synonym
            </div>
            <div
              className={clsx(
                "text-lg transition-all",
                reviseMode &&
                  !isRevealingSynonym &&
                  "select-none filter blur-sm"
              )}
            >
              {current?.synonym ?? "—"}
            </div>
            {!reviseMode && (
              <>
                <div className="text-xs uppercase text-muted-foreground pt-3">
                  Sentence
                </div>
                <div className="text-base">{current?.sentence ?? "—"}</div>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border bg-muted p-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-12 w-12 p-0"
                onClick={handlePrev}
                aria-label="Previous"
                title="Previous"
              >
                <PrevIcon />
              </Button>

              {!isPlaying && !isPausedRef.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-12 w-12 p-0"
                  onClick={handlePlay}
                  aria-label="Play"
                  title="Play"
                >
                  <PlayIcon />
                </Button>
              )}
              {isPausedRef.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-12 w-12 p-0"
                  onClick={handleResume}
                  aria-label="Resume"
                  title="Resume"
                >
                  <PlayIcon />
                </Button>
              )}
              {isPlaying && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-12 w-12 p-0"
                  onClick={handlePause}
                  aria-label="Pause"
                  title="Pause"
                >
                  <PauseIcon />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-12 w-12 p-0"
                onClick={handleNext}
                aria-label="Next"
                title="Next"
              >
                <NextIcon />
              </Button>
            </div>

            <div className="flex items-center gap-2 rounded-md border bg-muted p-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-12 w-12 p-0"
                onClick={handleRestart}
                aria-label="Start Over"
                title="Start Over"
              >
                <RestartIcon />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-12 w-12 p-0"
                onClick={handleStop}
                aria-label="Stop"
                title="Stop"
              >
                <StopIcon />
              </Button>
            </div>
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
