"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Play, Plus, Check, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import { VideoOrCover } from "@/components/common/VideoOrCover";
import { FilmCover } from "@/components/common/Covers";
import { useUser } from "@/store/user";
import { useUI } from "@/store/ui";
import { compact } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Film } from "@/lib/types";

const INTERVAL = 7000;

/** Disney+-style billboard: season Top 3, muted loop (or Ken Burns), swipe. */
export function HeroBillboard({ films }: { films: Film[] }) {
  const [i, setI] = useState(0);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const saved = useUser((s) => s.filmSaved);
  const toggle = useUser((s) => s.toggle);
  const toast = useUI((s) => s.toast);
  const go = useCallback((d: number) => setI((v) => (v + d + films.length) % films.length), [films.length]);

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => go(1), INTERVAL);
    return () => window.clearTimeout(t);
  }, [i, paused, go]);

  const f = films[i];
  const heroKey = `hero_fm_${String(i + 1).padStart(2, "0")}`;
  const isSaved = saved.includes(f.id);

  return (
    <section
      className="relative h-[min(132vw,640px)] w-full overflow-hidden md:h-[min(82vh,720px)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={f.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) go(1);
            else if (info.offset.x > 50) go(-1);
          }}
        >
          <VideoOrCover name={heroKey} muted={muted} alt={i % 2 === 1} className="absolute inset-0">
            <FilmCover film={f} srcKey={heroKey} className="absolute inset-0" sizes="100vw" priority={i === 0} />
          </VideoOrCover>
        </motion.div>
      </AnimatePresence>
      {/* cinematic vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0D1C] via-[#0A0D1C]/30 to-black/40" />
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#0A0D1C]/90 via-[#0A0D1C]/30 to-transparent md:block" />

      <div className="absolute inset-x-0 bottom-0 pb-8 md:pb-16">
        <div className="mx-auto max-w-[1200px] px-5 md:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="max-w-[560px] text-white"
            >
              <p className="text-[12px] font-bold tracking-[0.25em] text-[#7db3ff]">SEASON {f.season} · NO.{f.rank}</p>
              <h2 className="mt-2 text-balance font-serif text-[40px] font-black leading-[1.02] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] md:text-[64px]">
                {f.title}
              </h2>
              <p className="mt-3 flex flex-wrap items-center gap-x-2 text-[13px] text-white/75 md:text-[14px]">
                <span>{f.genres.join(" · ")}</span>
                <span className="opacity-40">|</span>
                <span>{f.runtime}</span>
                <span className="opacity-40">|</span>
                <span>좋아요 {compact(f.stats.likes)}</span>
                <span className="rounded border border-white/30 px-1 text-[11px]">AI</span>
              </p>
              <p className="mt-2.5 line-clamp-2 text-[15px] leading-snug text-white/85 md:text-[17px]">{f.logline}</p>
              <div className="mt-5 flex items-center gap-2.5">
                <Link href={`/film/work/${f.id}`} className="flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-bold text-white shadow-[0_8px_30px_rgba(49,130,246,0.45)] transition hover:brightness-110">
                  <Play size={17} className="fill-white" /> 티저 보기
                </Link>
                <button
                  onClick={() => toast(toggle("filmSaved", f.id) ? "저장했어요 · MY에서 볼 수 있어요" : "저장을 취소했어요")}
                  className="glass flex h-12 items-center gap-1.5 rounded-xl px-5 text-[15px] font-bold transition hover:bg-white/15"
                >
                  {isSaved ? <Check size={18} /> : <Plus size={18} />} 저장
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex items-center gap-2">
            {films.map((x, k) => (
              <button key={x.id} onClick={() => setI(k)} aria-label={`${k + 1}번째`} className={cn("h-1.5 rounded-full transition-all", k === i ? "w-7 bg-white" : "w-1.5 bg-white/35")} />
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "소리 켜기" : "음소거"}
        className="absolute bottom-9 right-4 grid size-10 place-items-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur md:bottom-16 md:right-[max(24px,calc(50vw-600px+24px))]"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      <button onClick={() => go(-1)} aria-label="이전" className="absolute left-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white opacity-60 backdrop-blur transition hover:opacity-100 lg:grid">
        <ChevronLeft size={26} />
      </button>
      <button onClick={() => go(1)} aria-label="다음" className="absolute right-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white opacity-60 backdrop-blur transition hover:opacity-100 lg:grid">
        <ChevronRight size={26} />
      </button>
    </section>
  );
}
