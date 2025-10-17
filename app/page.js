import WordPlayer from "../components/WordPlayer";
import { ThemeToggle } from "../components/ThemeToggle";

export default function Page() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto flex max-w-xl items-center justify-between pb-6">
        <h1 className="text-xl font-semibold">WordWalk</h1>
        <ThemeToggle />
      </div>
      <WordPlayer />
      <footer className="mx-auto max-w-xl pt-6 text-center text-xs text-muted-foreground">
        Built with Next.js 13.5 · Ready for Vercel
      </footer>
    </main>
  );
}
