import WordPlayer from "../components/WordPlayer";
import { ThemeToggle } from "../components/ThemeToggle";
import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto flex max-w-xl items-center justify-between pb-6">
        <h1 className="text-xl font-semibold">WordWalk ⛰️</h1>
        <ThemeToggle />
      </div>
      <WordPlayer />
      <footer className="mx-auto max-w-xl pt-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto inline-flex items-center gap-3">
          <Link
            href="https://syeasar.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
          >
            vibe-coded by S Yeasar
          </Link>
          <span>·</span>
          <Link
            href="https://github.com/y3454r/wordwalk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline hover:opacity-80"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.92.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.35-1.29-1.71-1.29-1.71-1.06-.73.08-.72.08-.72 1.17.08 1.78 1.2 1.78 1.2 1.04 1.77 2.73 1.26 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .98-.31 3.2 1.18.93-.26 1.93-.39 2.92-.39.99 0 1.99.13 2.92.39 2.22-1.5 3.2-1.18 3.2-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.82 1.19 3.08 0 4.43-2.7 5.41-5.27 5.7.42.36.79 1.07.79 2.15 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56C20.21 21.4 23.5 17.09 23.5 12 23.5 5.65 18.35.5 12 .5z" />
            </svg>
            GitHub
          </Link>
        </div>
      </footer>
    </main>
  );
}
