"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Star, Volume2, VolumeX, Play, Heart } from "lucide-react";
import { VideoOrCover } from "@/components/common/VideoOrCover";
import { WorkCover } from "@/components/common/Covers";
import { Badge } from "@/components/common/Badge";
import { useUser } from "@/store/user";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/cn";
import type { Webtoon } from "@/lib/types";

const INTERVAL = 5000;

/** Weekly #1~#3 as a living hero: muted loop video if present, else Ken Burns cover. */
export function HeroCarousel({ works }: { works: Webtoon[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const next = useCallback((d = 1) => setI((v) => (v + d + works.length) % works.length), [works.length]);
  const liked = useUser((s) => s.liked);
  const toggle = useUser((s) => s.toggle);
  const toast = useUI((s) => s.toast);

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => next(1), INTERVAL);
    return () => window.clearTimeout(t);
  }, [i, paused, next]);

  const w = works[i];
  const heroKey = `hero_wt_${String(i + 1).padStart(2, "0")}`;
  const isLiked = liked.includes(w.id);

  return (
    <section
      className="relative h-[min(128vw,620px)] w-full overflow-hidden bg-black md:h-[560px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={w.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) next(1);
            else if (info.offset.x > 50) next(-1);
          }}
        >
          <VideoOrCover name={heroKey} muted={muted} alt={i % 2 === 1} className="absolute inset-0">
            {/* mobile: portrait art; desktop: wide art */}
            <WorkCover work={w} srcKey={heroKey} className="absolute inset-0 md:hidden" sizes="100vw" priority={i === 0} focus="50% 0%" />
            <WorkCover work={w} srcKey={heroKey} variant="wide" portraitFit="blur" className="absolute inset-0 hidden md:block" sizes="100vw" priority={i === 0} />
          </VideoOrCover>
          {/* always-dark scrim behind the white type (light mode included) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30 md:bg-gradient-to-r md:from-black/85 md:via-black/35 md:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-bg to-transparent md:h-16" />
        </motion.div>
      </AnimatePresence>

      {/* desktop floating poster */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full md:block">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-end px-6 pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 24, rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
              className="float-y relative aspect-[3/5] w-[250px] overflow-hidden rounded-xl shadow-[0_30px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/15"
            >
              <WorkCover work={w} showTitle className="absolute inset-0" sizes="270px" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 pb-12 md:bottom-auto md:top-0 md:flex md:h-full md:items-center md:pb-0 md:pt-10">
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="max-w-[560px] text-white"
            >
              <div className="flex items-center gap-1.5">
                <Badge tone="brand" className="h-[22px] px-2 text-[12px]">#{i + 1}</Badge>
                <span className="text-[13px] font-semibold text-white/80">이번 주 실시간 랭킹</span>
              </div>
              <Link href={`/work/${w.id}`}>
                <h2 className="mt-2.5 text-balance text-[34px] font-black leading-[1.08] tracking-tight drop-shadow-lg md:text-[52px]">{w.title}</h2>
              </Link>
              <div className="mt-2.5 flex items-center gap-2 text-[14px] text-white/85">
                <span>{w.author}</span>
                <span className="h-3 w-px bg-white/30" />
                <span className="flex items-center gap-1 font-bold text-white">
                  <Star size={14} className="fill-free text-free" />
                  {w.rating.toFixed(1)}
                </span>
                <span className="h-3 w-px bg-white/30" />
                <span>{w.genre}</span>
              </div>
              <p className="mt-2 line-clamp-2 max-w-[440px] text-[14px] leading-snug text-white/75 md:text-[16px]">{w.tagline}</p>
              <div className="mt-5 hidden items-center gap-2 md:flex">
                <Link href={`/work/${w.id}?tab=first`} className="flex h-12 items-center gap-2 rounded-full bg-brand px-6 text-[15px] font-bold text-white transition hover:brightness-110">
                  <Play size={17} className="fill-white" /> 첫 화 보기
                </Link>
                <button
                  onClick={() => toast(toggle("liked", w.id) ? "관심 작품에 추가했어요" : "관심 작품에서 뺐어요")}
                  className="grid size-12 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25"
                  aria-label="관심"
                >
                  <Heart size={20} className={cn(isLiked && "fill-up text-up")} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* indicator bars */}
          <div className="mt-5 flex items-center gap-1.5 md:mt-8">
            {works.map((x, k) => (
              <button key={x.id} onClick={() => setI(k)} aria-label={`${k + 1}번째 배너`} className="relative h-[3px] w-8 overflow-hidden rounded-full bg-white/25 md:w-12">
                {k === i && (
                  <span
                    key={`${i}-${paused}`}
                    className="absolute inset-0 origin-left rounded-full bg-white"
                    style={{ animation: paused ? "none" : `progress-fill ${INTERVAL}ms linear forwards`, transform: paused ? "scaleX(1)" : undefined }}
                  />
                )}
                {k < i && <span className="absolute inset-0 rounded-full bg-white/60" />}
              </button>
            ))}
            <span className="ml-2 text-[12px] font-semibold tabular-nums text-white/70">
              {i + 1} / {works.length}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "소리 켜기" : "음소거"}
        className="absolute bottom-11 right-4 grid size-10 place-items-center rounded-full bg-black/40 text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-black/60 md:bottom-10 md:right-[max(24px,calc(50vw-600px+24px))]"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </section>
  );
}
