import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Large outline rank numeral, Netflix-Top-10 style, brand-gradient fill. */
export function RankNumber({
  rank,
  className,
}: {
  rank: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-brand-gradient font-black leading-none tabular-nums select-none",
        className,
      )}
      style={{
        WebkitTextStroke: "1px rgba(249,249,249,0.18)",
      }}
      aria-label={`${rank}위`}
    >
      {rank}
    </span>
  );
}

/** ▲2 / ▼1 / NEW / – movement indicator. delta = prev_rank - rank. */
export function RankDeltaBadge({
  delta,
  className,
}: {
  delta: number | null;
  className?: string;
}) {
  if (delta === null) {
    return (
      <span
        className={cn(
          "rounded bg-brand-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-accent",
          className,
        )}
      >
        NEW
      </span>
    );
  }
  if (delta === 0) {
    return (
      <span
        className={cn(
          "flex items-center gap-0.5 text-[11px] font-semibold text-text-muted",
          className,
        )}
      >
        <Minus className="h-3 w-3" />
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-[11px] font-bold tabular-nums",
        up ? "text-success" : "text-danger",
        className,
      )}
    >
      {up ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      {Math.abs(delta)}
    </span>
  );
}
