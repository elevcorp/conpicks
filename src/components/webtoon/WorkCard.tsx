"use client";
import Link from "next/link";
import { Heart, Share2, Bookmark, Star, Eye } from "lucide-react";
import { WorkCover, hasRealCover } from "@/components/common/Covers";
import { Badge, CardBadges } from "@/components/common/Badge";
import { RankDelta } from "@/components/common/RankDelta";
import { compact } from "@/lib/format";
import { pastel, deepTone } from "@/lib/color";
import { cn } from "@/lib/cn";
import type { RankChange, Webtoon } from "@/lib/types";

export const needsTitleOverlay = (w: Pick<Webtoon, "id" | "coverTitle">) => !hasRealCover(w.id) || w.coverTitle === false;

/** Kakao-style tall card: cover, badges top-left, title/author over a bottom gradient. Hover → preview. */
export function WorkCard({ work, className, href, reviewBadge, sizes, priority, hideAuthor }: {
  work: Webtoon; className?: string; href?: string; reviewBadge?: boolean; sizes?: string; priority?: boolean; hideAuthor?: boolean;
}) {
  return (
    <Link href={href ?? `/work/${work.id}`} className={cn("group/card block", className)}>
      <div className="relative aspect-[3/5] overflow-hidden rounded-[6px] bg-elev transition-transform duration-300 md:group-hover/card:z-10 md:group-hover/card:scale-[1.04] md:group-hover/card:shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
        <WorkCover work={work} className="absolute inset-0" sizes={sizes ?? "(max-width: 768px) 34vw, 200px"} priority={priority} />
        <CardBadges badges={work.badges} className="absolute left-1.5 top-1.5 z-[1]" />
        {reviewBadge && <Badge label="지무비 리뷰" className="absolute right-1.5 top-1.5 z-[1]" />}
        {/* real covers carry their title logo in the art — overlay only when they don't */}
        {needsTitleOverlay(work) && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-2 pb-2 pt-12">
            <p className="line-clamp-2 text-[14px] font-bold leading-tight text-white md:text-[15px]">{work.title}</p>
            {!hideAuthor && <p className="mt-0.5 truncate text-[11.5px] text-white/65">{work.writer}</p>}
          </div>
        )}
        {/* desktop hover preview */}
        <div className="absolute inset-0 hidden flex-col justify-end bg-black/75 p-3 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 md:flex md:group-hover/card:opacity-100">
          <p className="text-[15px] font-bold leading-tight text-white">{work.title}</p>
          <p className="mt-1.5 line-clamp-3 text-[12px] leading-snug text-white/75">{work.tagline}</p>
          <div className="mt-2 flex items-center gap-2 text-[11.5px] text-white/80">
            <span className="flex items-center gap-0.5"><Star size={11} className="fill-free text-free" />{work.rating.toFixed(2)}</span>
            <span className="flex items-center gap-0.5"><Eye size={11} />{work.views}</span>
          </div>
          <span className="mt-2.5 rounded-md bg-brand py-1.5 text-center text-[12px] font-bold text-white">작품 보기</span>
        </div>
      </div>
    </Link>
  );
}

export function StatLine({ stats, className, size = "sm" }: { stats: Webtoon["stats"]; className?: string; size?: "xs" | "sm" }) {
  const xs = size === "xs";
  const s = xs ? 10 : 12;
  // narrow grid cells: round to whole 만 so three metrics fit on one line
  const f = (n: number) => (xs && n >= 10000 ? `${Math.round(n / 10000)}만` : compact(n));
  return (
    <div className={cn("flex items-center gap-2 whitespace-nowrap text-fg-3", xs ? "text-[10.5px]" : "text-[12px]", className)}>
      <span className="flex items-center gap-0.5"><Heart size={s} className="fill-current" />{f(stats.likes)}</span>
      <span className="flex items-center gap-0.5"><Share2 size={s} />{f(stats.shares)}</span>
      <span className="flex items-center gap-0.5"><Bookmark size={s} />{f(stats.saves)}</span>
    </div>
  );
}

/** Naver-style realtime ranking row: square thumb · big rank · title · delta. */
export function RankRow({ work, rank, change, showStats }: { work: Webtoon; rank: number; change: RankChange; showStats?: boolean }) {
  return (
    <Link href={`/work/${work.id}`} className="group flex items-center gap-3 rounded-xl px-4 py-2 transition-colors hover:bg-chip md:px-2">
      <div className="relative size-[64px] shrink-0 overflow-hidden rounded-[8px] bg-elev">
        <WorkCover work={work} variant="square" className="absolute inset-0 transition-transform duration-500 group-hover:scale-110" sizes="64px" />
      </div>
      <span className={cn("w-7 shrink-0 text-center text-[22px] font-black italic tabular-nums", rank <= 3 ? "text-fg" : "text-fg-2")}>{rank}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[15px] font-bold">{work.title}</p>
          {work.badges.includes("UP") && <Badge label="UP" />}
        </div>
        {showStats ? (
          <StatLine stats={work.stats} className="mt-1" />
        ) : (
          <p className="mt-0.5 truncate text-[12.5px] text-fg-3">
            {work.writer} · {work.genre}
          </p>
        )}
      </div>
      <RankDelta change={change} className="w-9 shrink-0 text-right" />
    </Link>
  );
}

/** Naver '이달의 신작' pastel card. */
export function NewWorkCard({ work }: { work: Webtoon }) {
  const bg = pastel(work.themeColor);
  return (
    <Link
      href={`/work/${work.id}`}
      className="group relative flex h-[148px] w-[290px] overflow-hidden rounded-2xl transition-transform duration-300 md:w-[340px] md:hover:-translate-y-1"
      style={{ background: bg, color: deepTone(work.themeColor) }}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center py-4 pl-4 pr-2">
        <Badge label="신작" className="mb-2 w-fit" />
        <p className="line-clamp-2 text-[17px] font-extrabold leading-tight">{work.title}</p>
        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-snug opacity-75">{work.tagline}</p>
      </div>
      <div className="relative my-3 mr-3 aspect-[3/5] shrink-0 overflow-hidden rounded-lg shadow-lg">
        <WorkCover work={work} className="absolute inset-0 transition-transform duration-500 group-hover:scale-110" sizes="100px" />
      </div>
    </Link>
  );
}
