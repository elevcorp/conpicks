"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Share2, Bookmark, Trophy } from "lucide-react";
import { FilmCover } from "@/components/common/Covers";
import { RankDelta } from "@/components/common/RankDelta";
import { compact } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Film, RankEntry } from "@/lib/types";

type Row = RankEntry & { film: Film };
const SEASONS = [
  { k: 1, label: "시즌 1 · 진행중" },
  { k: 0, label: "프리시즌 · 종료" },
] as const;

export function FilmRanking({ s1, s0 }: { s1: Row[]; s0: Row[] }) {
  const [season, setSeason] = useState<0 | 1>(1);
  const rows = (season === 1 ? s1 : s0).slice(0, 20); // Top 20
  return (
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <div className="hidden pb-6 pt-10 md:block">
        <h1 className="text-[30px] font-extrabold">티저 랭킹</h1>
        <p className="mt-1.5 text-[15px] text-fg-2">좋아요·공유·저장·댓글로 매시간 갱신 · 2026.09.28 14:00 기준</p>
      </div>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#10204f] via-[#1b3a8a] to-[#3182F6] p-5 md:p-7">
        <Trophy className="absolute -right-3 -top-3 text-white/15" size={120} />
        <p className="text-[12px] font-bold tracking-[0.2em] text-white/70">SEASON 1 · D-12</p>
        <p className="mt-1 text-[19px] font-extrabold leading-snug md:text-[26px]">시즌1 우승작은 NEW와 함께 제작됩니다</p>
        <p className="mt-1 text-[13px] text-white/75 md:text-[15px]">1위 티저 → 90분 장편 제작 · 대중 펀딩 오픈</p>
      </div>

      <div className="mt-5 flex gap-2">
        {SEASONS.map((s) => (
          <button key={s.k} onClick={() => setSeason(s.k)} className={cn("h-9 rounded-full px-4 text-[14px] font-semibold transition-colors", season === s.k ? "bg-white text-[#0A0D1C]" : "bg-white/10 text-fg-2")}>
            {s.label}
          </button>
        ))}
      </div>

      <motion.ol key={season} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid gap-x-8 md:grid-cols-2">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/film/work/${r.film.id}`} className="group flex items-center gap-3 rounded-2xl py-3 transition-colors hover:bg-white/5 md:px-2">
              <span className={cn("w-11 shrink-0 text-center text-[34px] font-black italic leading-none", r.rank <= 3 ? "text-outline" : "text-white/80")}>{r.rank}</span>
              <div className="relative aspect-video w-[132px] shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10 md:w-[160px]">
                <FilmCover film={r.film} className="absolute inset-0 transition-transform duration-500 group-hover:scale-110" sizes="160px" />
                {r.film.award && <span className="absolute left-1 top-1 rounded bg-[#FFD54F] px-1 text-[10px] font-bold text-[#191F28]">{r.film.award.replace("프리시즌 ", "")}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold">{r.film.title}</p>
                <p className="truncate text-[12px] text-fg-3">{r.film.creator} · {r.film.genre}</p>
                <div className="mt-1.5 flex gap-2 whitespace-nowrap text-[11.5px] text-fg-2">
                  <span className="flex items-center gap-0.5"><Heart size={11} className="fill-current" />{compact(r.film.stats.likes)}</span>
                  <span className="flex items-center gap-0.5"><Share2 size={11} />{compact(r.film.stats.shares)}</span>
                  <span className="flex items-center gap-0.5"><Bookmark size={11} />{compact(r.film.stats.saves)}</span>
                </div>
              </div>
              <RankDelta change={r.change} className="w-9 shrink-0 text-center" />
            </Link>
          </li>
        ))}
      </motion.ol>
    </div>
  );
}
