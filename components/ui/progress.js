import { clsx } from "clsx";

export function Progress({ value = 0, className }) {
  return (
    <div
      className={clsx(
        "h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
