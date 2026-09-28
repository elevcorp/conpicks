"use client";
import Link from "next/link";
import { Play, Heart } from "lucide-react";
import { FilmCover } from "@/components/common/Covers";
import { RankDelta } from "@/components/common/RankDelta";
import { compact } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Film } from "@/lib/types";

export const teaserW = "w-[68vw] max-w-[300px] md:w-[calc((100%-48px)/3)] md:max-w-none lg:w-[calc((100%-64px)/4)]";

/** 16:9 glass card — hover: scale 1.05 + blue glow (Disney+/Apple TV feel). */
export function TeaserCard({ film, className, sizes }: { film: Film; className?: string; sizes?: string }) {
  return (
    <Link href={`/film/work/${film.id}`} className={cn("group/t block", className)}>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition-all duration-300 md:group-hover/t:z-10 md:group-hover/t:scale-105 md:group-hover/t:shadow-[0_0_0_1px_rgba(49,130,246,0.6),0_18px_50px_rgba(49,130,246,0.35)]">
        <FilmCover film={film} className="absolute inset-0" sizes={sizes ?? "(max-width: 768px) 70vw, 300px"} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        <span className="absolute right-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur">{film.runtime}</span>
        {film.award && <span className="absolute left-2 top-2 rounded-md bg-[#FFD54F] px-1.5 py-0.5 text-[10.5px] font-bold text-[#191F28]">{film.award}</span>}
        <span className="absolute inset-0 m-auto grid size-12 place-items-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur transition-opacity duration-300 md:group-hover/t:opacity-100">
          <Play size={20} className="ml-0.5 fill-white" />
        </span>
      </div>
      <div className="mt-2 flex items-start justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-bold">{film.title}</p>
          <p className="truncate text-[12px] text-fg-3">{film.creator} · {film.genres.join(" · ")}</p>
        </div>
        <span className="flex shrink-0 items-center gap-0.5 pt-0.5 text-[11.5px] text-fg-3">
          <Heart size={11} className="fill-current" /> {compact(film.stats.likes)}
        </span>
      </div>
    </Link>
  );
}

/** Netflix Top-10 grammar: giant outline rank + 16:9 thumbnail. */
export function Top10Card({ film }: { film: Film }) {
  return (
    <Link href={`/film/work/${film.id}`} className="group/t relative flex w-[78vw] max-w-[380px] items-end md:w-[calc((100%-32px)/3)] md:max-w-none lg:w-[calc((100%-48px)/3.4)]">
      <span className="text-outline relative z-0 -mr-5 select-none text-[112px] font-black italic leading-[0.8] tracking-tighter md:-mr-7 md:text-[150px]">{film.rank}</span>
      <div className="relative z-10 flex-1">
        <div className="relative aspect-video overflow-hidden rounded-xl ring-1 ring-white/10 transition-all duration-300 md:group-hover/t:scale-105 md:group-hover/t:shadow-[0_0_0_1px_rgba(49,130,246,0.6),0_18px_50px_rgba(49,130,246,0.35)]">
          <FilmCover film={film} className="absolute inset-0" sizes="300px" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2 pt-8">
            <p className="truncate text-[14px] font-bold text-white">{film.title}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-white/70">
              <RankDelta change={film.rankChange} className="text-[11px]" />
              <span>공유 {compact(film.stats.shares)} · 저장 {compact(film.stats.saves)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
