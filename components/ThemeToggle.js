"use client";

import { Button } from "./ui/button";
import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";

function SunIcon(props) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon(props) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const mq =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    if (!mq) return;
    const set = () => setSystemDark(!!mq.matches);
    set();
    mq.addEventListener
      ? mq.addEventListener("change", set)
      : mq.addListener(set);
    return () => {
      mq.removeEventListener
        ? mq.removeEventListener("change", set)
        : mq.removeListener(set);
    };
  }, []);

  const resolvedDark = theme === "dark" || (theme === "system" && systemDark);
  const Icon = resolvedDark ? SunIcon : MoonIcon; // show alternate icon (what you can switch to)
  const next = () => setTheme(resolvedDark ? "light" : "dark");
  const label = resolvedDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Button variant="ghost" onClick={next} aria-label={label} title={label}>
      <Icon />
    </Button>
  );
}
