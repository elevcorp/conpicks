import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { TeaserCardVM } from "@/lib/types";
import { RankingCard, TeaserCard } from "./TeaserCard";

/** Horizontal-scroll section: left title + "전체보기 >", right of it the cards. */
export function TeaserRow({
  title,
  items,
  href,
  variant = "poster",
}: {
  title: string;
  items: TeaserCardVM[];
  href?: string;
  variant?: "poster" | "ranking";
}) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-text-primary">{title}</h2>
        {href && (
          <Link
            href={href}
            className="flex items-center text-xs text-text-muted transition-colors hover:text-text-primary"
          >
            전체보기 <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {items.map((vm) =>
          variant === "ranking" ? (
            <RankingCard key={vm.teaser.id} vm={vm} />
          ) : (
            <TeaserCard
              key={vm.teaser.id}
              vm={vm}
              className="w-[8.5rem] shrink-0 sm:w-40"
            />
          ),
        )}
      </div>
    </section>
  );
}
