"use client";

import { motion } from "framer-motion";
import { Bookmark, Heart, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { compactCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TeaserCardVM } from "@/lib/types";
import { GenreChips } from "./GenreChips";
import { RankDeltaBadge, RankNumber } from "./RankBits";

/** 2:3 poster card — the default across rows/grids (디즈니+ 타일 인터랙션). */
export function TeaserCard({
  vm,
  showRank = false,
  className,
}: {
  vm: TeaserCardVM;
  showRank?: boolean;
  className?: string;
}) {
  const { teaser, stats, creator, rankDelta } = vm;
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn("group relative", className)}
    >
      <Link href={`/t/${teaser.slug}`} className="block">
        <div className="border-brand-gradient relative aspect-[2/3] overflow-hidden rounded-xl border">
          <Image
            src={teaser.poster_url}
            alt={teaser.title}
            fill
            sizes="(max-width:768px) 45vw, 200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          {showRank && stats.rank > 0 && (
            <div className="absolute top-1 left-1 flex items-end gap-1">
              <RankNumber rank={stats.rank} className="text-4xl" />
              <RankDeltaBadge delta={rankDelta} className="mb-1" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-2.5">
            <p className="line-clamp-1 text-sm font-bold text-white">
              {teaser.title}
            </p>
            <p className="line-clamp-1 text-[11px] text-white/70">
              {creator.nickname}
            </p>
          </div>
        </div>
      </Link>
      <div className="mt-1.5 flex items-center gap-3 px-0.5 text-[11px] text-text-muted">
        <span className="flex items-center gap-1">
          <Heart className="h-3 w-3" /> {compactCount(stats.like_count)}
        </span>
        <span className="flex items-center gap-1">
          <Share2 className="h-3 w-3" /> {compactCount(stats.share_count)}
        </span>
        <span className="flex items-center gap-1">
          <Bookmark className="h-3 w-3" /> {compactCount(stats.save_count)}
        </span>
      </div>
    </motion.div>
  );
}

/** 16:9 thumbnail card with oversized rank numeral for the Top-10 row. */
export function RankingCard({ vm }: { vm: TeaserCardVM }) {
  const { teaser, stats, rankDelta } = vm;
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group flex w-[16.5rem] shrink-0 items-center gap-1"
    >
      <div className="flex flex-col items-center">
        <RankNumber rank={stats.rank} className="text-6xl" />
        <RankDeltaBadge delta={rankDelta} />
      </div>
      <Link href={`/t/${teaser.slug}`} className="min-w-0 flex-1">
        <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
          <Image
            src={teaser.thumbnail_url}
            alt={teaser.title}
            fill
            sizes="240px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-2">
            <p className="line-clamp-1 text-xs font-bold text-white">
              {teaser.title}
            </p>
            <GenreChips genres={teaser.genres.slice(0, 2)} className="mt-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
