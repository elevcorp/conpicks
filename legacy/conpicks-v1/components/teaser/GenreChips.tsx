import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Genre } from "@/lib/types";

export function GenreChips({
  genres,
  className,
  asLinks = false,
}: {
  genres: Genre[];
  className?: string;
  asLinks?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {genres.map((g) => {
        const chip = (
          <span
            key={g}
            className="rounded-full border border-border bg-white/5 px-2 py-0.5 text-[11px] font-medium text-text-secondary"
          >
            {g}
          </span>
        );
        return asLinks ? (
          <Link key={g} href={`/discover/${encodeURIComponent(g)}`}>
            {chip}
          </Link>
        ) : (
          chip
        );
      })}
    </div>
  );
}
