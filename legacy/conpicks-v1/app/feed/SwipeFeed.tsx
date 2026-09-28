"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallbackRef } from "@/lib/use-callback-ref";
import { useEffect, useRef, useState } from "react";
import { ActionBar } from "@/components/teaser/ActionBar";
import { GenreChips } from "@/components/teaser/GenreChips";
import { RankNumber } from "@/components/teaser/RankBits";
import { getViewSessionId } from "@/lib/session";
import type { TeaserCardVM } from "@/lib/types";
import { cn } from "@/lib/utils";

type Sort = "rank" | "new" | "random";

export function SwipeFeed({
  initialItems,
  initialCursor,
  sort,
  loggedIn,
  currentUserId,
}: {
  initialItems: TeaserCardVM[];
  initialCursor: string | null;
  sort: Sort;
  loggedIn: boolean;
  currentUserId: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);

  async function loadMore() {
    if (loading || !cursor) return;
    setLoading(true);
    const res = await fetch(`/api/feed?sort=${sort}&cursor=${cursor}`);
    const json = await res.json();
    setItems((cur) => dedupe([...cur, ...json.items]));
    setCursor(json.nextCursor);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
        <Link
          href="/"
          className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
          aria-label="홈으로"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="pointer-events-auto flex gap-1 rounded-full bg-black/40 p-1 backdrop-blur">
          {(
            [
              ["rank", "랭킹순"],
              ["new", "최신순"],
              ["random", "랜덤"],
            ] as const
          ).map(([s, label]) => (
            <Link
              key={s}
              href={`/feed?sort=${s}`}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                sort === s ? "bg-white text-black" : "text-white/80",
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollHeight - el.scrollTop - el.clientHeight < el.clientHeight * 1.5)
            loadMore();
        }}
        className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll"
      >
        {items.map((vm) => (
          <FeedSlide
            key={vm.teaser.id}
            vm={vm}
            loggedIn={loggedIn}
            ownTeaser={currentUserId === vm.teaser.creator_id}
          />
        ))}
        {loading && (
          <div className="grid h-24 place-items-center text-sm text-white/60">
            불러오는 중…
          </div>
        )}
      </div>
    </div>
  );
}

function FeedSlide({
  vm,
  loggedIn,
  ownTeaser,
}: {
  vm: TeaserCardVM;
  loggedIn: boolean;
  ownTeaser: boolean;
}) {
  const { teaser, stats } = vm;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(false);
  const sent = useRef<Set<string>>(new Set());

  const setNode = useCallbackRef((node: HTMLDivElement | null) => {
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && entry.intersectionRatio > 0.6),
      { threshold: [0, 0.6, 1] },
    );
    io.observe(node);
    return () => io.disconnect();
  });

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.play().catch(() => {});
      emit("start");
    } else {
      v.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function emit(event: "start" | "half" | "complete") {
    if (sent.current.has(event)) return;
    sent.current.add(event);
    fetch(`/api/teasers/${teaser.id}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, sessionId: getViewSessionId() }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <section
      ref={setNode}
      className="relative flex h-full snap-start snap-always items-center justify-center overflow-hidden"
    >
      {/* blurred backdrop keeps 16:9 originals uncropped */}
      <Image
        src={teaser.poster_url}
        alt=""
        fill
        sizes="100vw"
        className="scale-110 object-cover opacity-40 blur-2xl"
      />
      <video
        ref={videoRef}
        src={teaser.playback_url}
        poster={teaser.thumbnail_url}
        muted
        loop
        playsInline
        preload="metadata"
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration && v.currentTime / v.duration >= 0.5) emit("half");
        }}
        onEnded={() => emit("complete")}
        className="relative z-10 max-h-full w-full object-contain"
      />

      <div className="absolute right-3 bottom-28 z-20">
        <ActionBar
          teaserId={teaser.id}
          slug={teaser.slug}
          loggedIn={loggedIn}
          ownTeaser={ownTeaser}
          layout="column"
          initial={{
            like: stats.like_count,
            comment: stats.comment_count,
            share: stats.share_count,
            save: stats.save_count,
            liked: false,
            saved: false,
          }}
        />
      </div>

      <Link
        href={`/t/${teaser.slug}`}
        className="absolute inset-x-0 bottom-0 z-20 space-y-1.5 bg-gradient-to-t from-black/80 to-transparent p-4 pb-6"
      >
        <div className="flex items-center gap-2">
          {stats.rank > 0 && (
            <RankNumber rank={stats.rank} className="text-3xl" />
          )}
          <h2 className="text-lg font-extrabold text-white">{teaser.title}</h2>
        </div>
        <GenreChips genres={teaser.genres} />
        <p className="line-clamp-2 max-w-md text-sm text-white/80">
          {teaser.logline}
        </p>
      </Link>
    </section>
  );
}

function dedupe(list: TeaserCardVM[]): TeaserCardVM[] {
  const seen = new Set<string>();
  return list.filter((v) =>
    seen.has(v.teaser.id) ? false : (seen.add(v.teaser.id), true),
  );
}
