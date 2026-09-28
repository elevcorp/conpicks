import { cn } from "@/lib/cn";
import type { RankChange } from "@/lib/types";

/** ▲2 (brand blue) / ▼1 (gray) / NEW (red) / – */
export function RankDelta({ change, className }: { change: RankChange; className?: string }) {
  if (change === "NEW") return <span className={cn("text-[11px] font-extrabold text-up", className)}>NEW</span>;
  if (change > 0) return <span className={cn("text-[12px] font-bold text-brand", className)}>▲{change}</span>;
  if (change < 0) return <span className={cn("text-[12px] font-bold text-fg-3", className)}>▼{-change}</span>;
  return <span className={cn("text-[12px] font-bold text-fg-3", className)}>–</span>;
}
