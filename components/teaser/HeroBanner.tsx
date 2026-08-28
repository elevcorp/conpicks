"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GenreChips } from "./GenreChips";
import { RankNumber } from "./RankBits";
import type { TeaserCardVM } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Full-bleed hero — muted 5s autoplay preview then poster fallback.
 * Left/right cycles the current season's Top 3.
 */
export function HeroBanner({ items }: { items: TeaserCardVM[] }) {
  const [idx, setIdx] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const go = useCallback(
    (d: number) => {
      setIdx((i) => (i + d + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    setPreviewing(false);
    const t = setTimeout(() => setPreviewing(true), 400);
    const stop = setTimeout(() => setPreviewing(false), 5400);
    return () => {
      clearTimeout(t);
      clearTimeout(stop);
    };
  }, [idx]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (previewing) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [previewing]);

  if (items.length === 0) return null;
  const vm = items[idx];
  const { teaser } = vm;

  return (
    <section className="relative -mx-4 h-[62vh] min-h-[420px] overflow-hidden md:mx-0 md:rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={teaser.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <Image
            src={teaser.poster_url}
            alt={teaser.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <video
            ref={videoRef}
            src={teaser.playback_url}
            muted
            playsInline
            preload="none"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              previewing ? "opacity-100" : "opacity-0"
            }`}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-bg-base/70 to-transparent" />

      <div className="absolute bottom-0 left-0 max-w-lg space-y-3 p-5 md:p-8">
        <div className="flex items-center gap-2">
          <RankNumber rank={vm.stats.rank || idx + 1} className="text-5xl" />
          <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-bold tracking-wide text-white backdrop-blur">
            시즌 1 랭킹
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white md:text-4xl">
          {teaser.title}
        </h1>
        <GenreChips genres={teaser.genres} />
        <p className="line-clamp-2 text-sm text-white/80">{teaser.logline}</p>
        <div className="flex gap-2 pt-1">
          <Link
            href={`/t/${teaser.slug}`}
            className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-sm")}
          >
            <Play className="h-4 w-4" /> 티저 보기
          </Link>
          <Link
            href={`/t/${teaser.slug}?action=save`}
            className={cn(
              buttonVariants({ size: "lg", variant: "secondary" }),
              "h-11 px-5 text-sm",
            )}
          >
            <Bookmark className="h-4 w-4" /> 저장
          </Link>
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 flex-col gap-2 md:left-3 md:right-auto">
          <button
            onClick={() => go(-1)}
            aria-label="이전"
            className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="다음"
            className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
      <div className="absolute right-5 bottom-5 flex gap-1.5">
        {items.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? "w-6 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
