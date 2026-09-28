"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Play, Pause, ChevronRight } from "lucide-react";
import { FilmCover } from "@/components/common/Covers";
import { VideoOrCover } from "@/components/common/VideoOrCover";
import { Sheet } from "@/components/common/Sheet";
import { useUser } from "@/store/user";
import { useUI } from "@/store/ui";
import { compact } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Film, FilmComment } from "@/lib/types";

const FILTERS = ["랭킹순", "최신순", "랜덤"] as const;

/** TikTok-style vertical snap feed of 16:9 teasers over a blurred backdrop. */
export function Feed({ films, comments }: { films: Film[]; comments: Record<string, FilmComment[]> }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("랭킹순");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [active, setActive] = useState(0);
  const [sheetFor, setSheetFor] = useState<Film | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    if (filter === "랭킹순") return [...films].sort((a, b) => (a.season === b.season ? a.rank - b.rank : b.season - a.season));
    if (filter === "최신순") return [...films].sort((a, b) => Number(b.id.slice(3)) - Number(a.id.slice(3)));
    // deterministic per shuffle press
    return [...films].sort((a, b) => ((Number(a.id.slice(3)) * 7919 + shuffleSeed) % 97) - ((Number(b.id.slice(3)) * 7919 + shuffleSeed) % 97));
  }, [films, filter, shuffleSeed]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => setActive(Math.round(el.scrollTop / el.clientHeight));
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, []);

  const pick = (f: (typeof FILTERS)[number]) => {
    setFilter(f);
    if (f === "랜덤") setShuffleSeed((s) => s + 31);
    ref.current?.scrollTo({ top: 0 });
    setActive(0);
  };

  return (
    <div className="fixed inset-0 z-0 bg-black md:top-16">
      {/* filters */}
      <div className="absolute inset-x-0 top-0 z-20 flex justify-center gap-5 pt-[calc(14px+env(safe-area-inset-top))] text-[16px] font-bold" style={{ textShadow: "0 1px 8px rgba(0,0,0,.6)" }}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => pick(f)} className={cn("relative pb-1.5 transition-colors", filter === f ? "text-white" : "text-white/55")}>
            {f}
            {filter === f && <motion.span layoutId="feed-filter" className="absolute inset-x-1 bottom-0 h-[2px] rounded-full bg-white" />}
          </button>
        ))}
      </div>

      <div ref={ref} className="scrollbar-none h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain">
        {list.map((f, i) => (
          <FeedItem key={`${filter}-${shuffleSeed}-${f.id}`} film={f} active={i === active} onComments={() => setSheetFor(f)} />
        ))}
      </div>

      <Sheet open={!!sheetFor} onClose={() => setSheetFor(null)} title={`댓글 ${sheetFor ? compact(sheetFor.stats.comments) : ""}`} film>
        <ul className="pb-3">
          {(sheetFor ? comments[sheetFor.id] ?? [] : []).map((c) => (
            <li key={c.id} className="border-b border-white/10 py-3.5">
              <p className="text-[13px] font-bold">{c.nickname} <span className="ml-1 font-normal text-fg-3">{c.date}</span></p>
              <p className="mt-1 text-[15px]">{c.body}</p>
              <p className="mt-1.5 text-[12px] text-fg-3">좋아요 {compact(c.likes)} · 답글 {c.replies}</p>
            </li>
          ))}
        </ul>
        {sheetFor && (
          <Link href={`/film/work/${sheetFor.id}`} className="mb-2 flex h-12 items-center justify-center rounded-xl bg-white/10 text-[14px] font-semibold">
            티저 상세에서 댓글 쓰기
          </Link>
        )}
      </Sheet>
    </div>
  );
}

function FeedItem({ film, active, onComments }: { film: Film; active: boolean; onComments: () => void }) {
  const [playing, setPlaying] = useState(false);
  const liked = useUser((s) => s.filmLiked.includes(film.id));
  const saved = useUser((s) => s.filmSaved.includes(film.id));
  const toggle = useUser((s) => s.toggle);
  const toast = useUI((s) => s.toast);

  // auto-"play" the visible item; stop when scrolled away
  useEffect(() => setPlaying(active), [active]);

  const actions = [
    { icon: Heart, label: compact(film.stats.likes + (liked ? 1 : 0)), on: () => toggle("filmLiked", film.id), activeCls: liked ? "fill-up text-up" : "" },
    { icon: MessageCircle, label: compact(film.stats.comments), on: onComments, activeCls: "" },
    { icon: Share2, label: compact(film.stats.shares), on: () => { navigator.clipboard?.writeText(`${location.origin}/film/work/${film.id}`).catch(() => {}); toast("링크를 복사했어요 · 공유는 랭킹 점수 ×4", "success"); }, activeCls: "" },
    { icon: Bookmark, label: saved ? "저장됨" : compact(film.stats.saves), on: () => toast(toggle("filmSaved", film.id) ? "저장했어요" : "저장을 취소했어요"), activeCls: saved ? "fill-white" : "" },
  ];

  return (
    <section className="relative flex h-full w-full snap-start snap-always items-center justify-center overflow-hidden">
      {/* blurred backdrop above & below the 16:9 frame */}
      <div className="absolute inset-0 scale-125 blur-2xl saturate-150">
        <FilmCover film={film} className="absolute inset-0" sizes="200px" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/60" />

      <div className="relative w-full md:max-w-[760px] md:px-24">
        <button onClick={() => setPlaying((p) => !p)} className="relative block aspect-video w-full overflow-hidden bg-black shadow-2xl md:rounded-2xl" aria-label={playing ? "일시정지" : "재생"}>
          <VideoOrCover name={`cover_${film.id}`} paused={!playing} className="absolute inset-0">
            <FilmCover film={film} className="absolute inset-0" sizes="(max-width:768px) 100vw, 760px" />
          </VideoOrCover>
          <AnimatePresence>
            {!playing && (
              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} className="absolute inset-0 m-auto grid size-16 place-items-center rounded-full bg-black/45 text-white backdrop-blur">
                <Play size={28} className="ml-1 fill-white" />
              </motion.span>
            )}
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
            {playing && <span key={film.id + String(playing)} className="block h-full origin-left bg-white" style={{ animation: "progress-fill 20s linear forwards" }} />}
          </div>
          {playing && <Pause className="absolute right-3 top-3 text-white/70" size={16} />}
        </button>
      </div>

      {/* right action rail */}
      <div className="absolute bottom-[calc(96px+env(safe-area-inset-bottom))] right-3 z-10 flex flex-col items-center gap-4 md:bottom-auto md:right-[calc(50%-372px)] md:top-1/2 md:-translate-y-1/2 md:gap-5">
          {actions.map(({ icon: I, label, on, activeCls }, k) => (
            <motion.button key={k} whileTap={{ scale: 0.85 }} onClick={on} className="flex flex-col items-center gap-1 text-[11.5px] font-semibold text-white" style={{ textShadow: "0 1px 6px rgba(0,0,0,.6)" }}>
              <span className="grid size-11 place-items-center rounded-full bg-black/25 backdrop-blur">
                <I size={24} className={activeCls} />
              </span>
              {label}
            </motion.button>
          ))}
          <Link href={`/film/work/${film.id}`} aria-label={film.creator} className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-brand to-[#7a5cff] text-[15px] font-black text-white ring-2 ring-white">
            {film.creator.slice(0, 1)}
          </Link>
      </div>

      {/* bottom-left meta */}
      <div className="absolute inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] px-4 pr-20 text-white md:bottom-10 md:left-1/2 md:max-w-[760px] md:-translate-x-1/2 md:px-24" style={{ textShadow: "0 1px 8px rgba(0,0,0,.7)" }}>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-brand px-2 py-0.5 text-[12px] font-bold">{film.season === 1 ? `시즌1 #${film.rank}` : film.award}</span>
          {film.genres.map((g) => (
            <span key={g} className="rounded-md bg-white/20 px-2 py-0.5 text-[12px] font-semibold backdrop-blur">{g}</span>
          ))}
        </div>
        <p className="mt-2 text-[20px] font-extrabold">{film.title}</p>
        <p className="text-[13px] text-white/75">@{film.creator} · {film.runtime}</p>
        <p className="mt-1 line-clamp-2 text-[14px] text-white/90">{film.logline}</p>
        <Link href={`/film/work/${film.id}`} className="mt-2.5 inline-flex items-center gap-0.5 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-semibold backdrop-blur">
          상세 · 랭킹 점수 보기 <ChevronRight size={15} />
        </Link>
      </div>
    </section>
  );
}
