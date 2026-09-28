"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Heart, MessageCircle, Share2, Bookmark, Sparkles, ArrowRight, HandCoins, Send, Cpu } from "lucide-react";
import { FilmCover } from "@/components/common/Covers";
import { VideoOrCover } from "@/components/common/VideoOrCover";
import { RankDelta } from "@/components/common/RankDelta";
import { useRequireLogin } from "@/components/common/LoginSheet";
import { TeaserCard } from "./TeaserCards";
import { useUser } from "@/store/user";
import { useUI } from "@/store/ui";
import { compact, won } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Film, FilmComment } from "@/lib/types";

// Same weights as the webtoon ranking info sheet.
const WEIGHTS = [
  { k: "shares", label: "공유", w: 4, color: "#3182F6" },
  { k: "saves", label: "저장", w: 3, color: "#7a5cff" },
  { k: "likes", label: "좋아요", w: 1, color: "#ff5c8a" },
  { k: "comments", label: "댓글", w: 2, color: "#2fc49a" },
] as const;

export function TeaserDetail({ film, comments, similar }: { film: Film; comments: FilmComment[]; similar: Film[] }) {
  const router = useRouter();
  const [playing, setPlaying] = useState(false);
  const [draft, setDraft] = useState("");
  const [mine, setMine] = useState<FilmComment[]>([]);
  const liked = useUser((s) => s.filmLiked.includes(film.id));
  const saved = useUser((s) => s.filmSaved.includes(film.id));
  const { toggle, nickname } = useUser();
  const toast = useUI((s) => s.toast);
  const requireLogin = useRequireLogin();

  const close = () => (window.history.length > 1 ? router.back() : router.push("/film"));

  const parts = WEIGHTS.map((m) => ({ ...m, v: film.stats[m.k] * m.w }));
  const total = parts.reduce((a, p) => a + p.v, 0);
  const demandIndex = Math.min(99, Math.round(60 + Math.log10(total) * 5.2 - film.rank * 0.6));

  const post = () =>
    requireLogin(() => {
      if (!draft.trim()) return;
      setMine((m) => [{ id: `me-${Date.now()}`, nickname, date: "방금", body: draft.trim(), likes: 0, replies: 0 }, ...m]);
      setDraft("");
      toast("댓글이 등록되었어요 · 랭킹 점수 +2", "success");
    });

  const actions = [
    { icon: Heart, label: compact(film.stats.likes + (liked ? 1 : 0)), on: () => toggle("filmLiked", film.id), on_: liked, cls: "fill-up text-up" },
    { icon: MessageCircle, label: compact(film.stats.comments), on: () => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" }), on_: false, cls: "" },
    { icon: Share2, label: "공유", on: () => { navigator.clipboard?.writeText(location.href).catch(() => {}); toast("링크를 복사했어요", "success"); }, on_: false, cls: "" },
    { icon: Bookmark, label: saved ? "저장됨" : "저장", on: () => toast(toggle("filmSaved", film.id) ? "저장했어요" : "저장을 취소했어요"), on_: saved, cls: "fill-white" },
  ];

  return (
    <div className="relative min-h-dvh">
      {/* backdrop */}
      <div className="fixed inset-0 -z-0">
        <div className="absolute inset-0 scale-110 opacity-50 blur-2xl">
          <FilmCover film={film} className="absolute inset-0" sizes="400px" />
        </div>
        <motion.div className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={close} />
      </div>

      <motion.article
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 260 }}
        className="relative z-10 mx-auto mt-[7vh] min-h-[93dvh] max-w-[780px] overflow-hidden rounded-t-[28px] bg-[#0d1126] shadow-[0_-20px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/10 md:mb-16 md:mt-24 md:min-h-0 md:rounded-[28px]"
      >
        <div className="flex justify-center pt-2.5 md:hidden">
          <span className="h-1 w-10 rounded-full bg-white/25" />
        </div>
        <button onClick={close} aria-label="닫기" className="absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70">
          <X size={20} />
        </button>

        {/* player */}
        <div className="px-0 pt-2 md:p-0">
          <button onClick={() => setPlaying((p) => !p)} className="relative block aspect-video w-full overflow-hidden bg-black" aria-label="티저 재생">
            <VideoOrCover name={`cover_${film.id}`} paused={!playing} muted={false} className="absolute inset-0">
              <FilmCover film={film} className="absolute inset-0" sizes="780px" priority />
            </VideoOrCover>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1126] via-transparent to-transparent" />
            <AnimatePresence>
              {!playing ? (
                <motion.span key="play" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.3 }} className="absolute inset-0 m-auto grid size-[72px] place-items-center rounded-full bg-white/90 text-black shadow-2xl">
                  <Play size={30} className="ml-1 fill-black" />
                </motion.span>
              ) : (
                <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  ▶ 재생 중 · 시연용 미리보기
                </motion.span>
              )}
            </AnimatePresence>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
              {playing && <span className="block h-full origin-left bg-brand" style={{ animation: "progress-fill 20s linear forwards" }} />}
            </div>
          </button>
        </div>

        <div className="space-y-7 px-5 pb-12 pt-4 md:px-8">
          {/* title */}
          <div>
            <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
              <span className="rounded-md bg-brand px-2 py-0.5 font-bold">{film.season === 1 ? `시즌1 · ${film.rank}위` : film.award}</span>
              {film.genres.map((g) => (
                <span key={g} className="rounded-md bg-white/10 px-2 py-0.5 font-semibold text-fg-2">{g}</span>
              ))}
            </div>
            <h1 className="mt-2.5 font-serif text-[28px] font-black leading-tight md:text-[34px]">{film.title}</h1>
            <p className="mt-1 text-[14px] text-fg-2">
              {film.creator} · {film.runtime} · <span className="inline-flex items-center gap-1"><Cpu size={13} />{film.tool}</span>
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-white/85">{film.logline}</p>
          </div>

          {/* actions */}
          <div className="grid grid-cols-4 gap-2">
            {actions.map(({ icon: I, label, on, on_, cls }, k) => (
              <motion.button key={k} whileTap={{ scale: 0.9 }} onClick={on} className={cn("flex flex-col items-center gap-1.5 rounded-2xl bg-white/5 py-3 text-[12.5px] font-semibold ring-1 ring-white/10 transition hover:bg-white/10", on_ && "text-white")}>
                <I size={22} className={cn(on_ && cls)} />
                {label}
              </motion.button>
            ))}
          </div>

          {/* ranking + score composition */}
          <section className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[12px] font-semibold text-fg-3">실시간 랭킹</p>
                <p className="mt-0.5 flex items-center gap-2 text-[22px] font-black">
                  {film.season === 1 ? `현재 ${film.rank}위` : `프리시즌 ${film.rank}위`}
                  {film.rankChange !== 0 && (
                    <span className="text-[14px] font-bold text-fg-2">
                      · 어제보다 <RankDelta change={film.rankChange} className="text-[14px]" />
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-semibold text-fg-3">흥행 수요 지수</p>
                <p className="text-[26px] font-black leading-none text-[#7db3ff]">{demandIndex}</p>
              </div>
            </div>
            <p className="mb-2 mt-5 text-[12.5px] font-semibold text-fg-2">점수 구성</p>
            <div className="flex h-3 overflow-hidden rounded-full">
              {parts.map((p, k) => (
                <motion.div
                  key={p.k}
                  style={{ background: p.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(p.v / total) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: k * 0.1 }}
                />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12.5px] md:grid-cols-4">
              {parts.map((p) => (
                <span key={p.k} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: p.color }} />
                  <span className="text-fg-2">{p.label} ×{p.w}</span>
                  <b className="ml-auto md:ml-0">{Math.round((p.v / total) * 100)}%</b>
                </span>
              ))}
            </div>
          </section>

          {/* jimovie */}
          {film.jimovieReview && (
            <section>
              <p className="mb-2.5 flex items-center gap-1.5 text-[15px] font-bold">
                <Sparkles size={16} className="text-[#FFD54F]" /> 지무비 리뷰
              </p>
              <button onClick={() => toast("시연 모드 · 정식 오픈 시 리뷰 영상이 재생됩니다")} className="group flex w-full items-center gap-3 rounded-2xl bg-black/40 p-3 text-left ring-1 ring-white/10">
                <div className="relative aspect-video w-[132px] shrink-0 overflow-hidden rounded-lg">
                  <FilmCover film={film} className="absolute inset-0 opacity-70" sizes="132px" />
                  <span className="absolute inset-0 m-auto grid size-9 place-items-center rounded-full bg-white/90 text-black"><Play size={15} className="ml-0.5 fill-black" /></span>
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] font-semibold">{film.jimovieReview.duration}</span>
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[14px] font-bold">[지무비] {film.jimovieReview.title}</p>
                  <p className="mt-1 text-[12px] text-fg-3">리뷰 조회수 {film.jimovieReview.views}회</p>
                </div>
              </button>
            </section>
          )}

          {film.funding && (
            <Link href="/film/funding" className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#1b3a8a] to-[#3182F6] p-4">
              <HandCoins size={22} />
              <div className="flex-1">
                <p className="text-[15px] font-bold">장편 제작 펀딩 진행 중 · 74%</p>
                <p className="text-[12.5px] text-white/80">D-12 · 1,847명 참여 · NEW 공동 제작</p>
              </div>
              <ArrowRight size={18} />
            </Link>
          )}

          {/* comments */}
          <section id="comments" className="scroll-mt-24">
            <p className="mb-3 text-[15px] font-bold">댓글 <span className="text-fg-3">{won(film.stats.comments + mine.length)}</span></p>
            <div className="mb-2 flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-white/10">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && post()} onFocus={() => requireLogin(() => {})} placeholder="이 티저, 극장에서 보고 싶나요?" className="h-9 flex-1 bg-transparent text-[14px] outline-none placeholder:text-white/40" aria-label="댓글 입력" />
              <button onClick={post} aria-label="등록" className={cn("grid size-9 place-items-center rounded-full", draft.trim() ? "bg-brand" : "text-fg-3")}><Send size={16} /></button>
            </div>
            <ul>
              {[...mine, ...comments].map((c) => (
                <li key={c.id} className="border-b border-white/10 py-3.5">
                  <p className="text-[13px] font-bold">{c.nickname} <span className="ml-1 font-normal text-fg-3">{c.date}</span></p>
                  <p className="mt-1 text-[15px] leading-relaxed">{c.body}</p>
                  <p className="mt-1.5 text-[12px] text-fg-3">좋아요 {compact(c.likes)} · 답글 {c.replies}</p>
                </li>
              ))}
            </ul>
          </section>

          {similar.length > 0 && (
            <section>
              <p className="mb-3 text-[15px] font-bold">비슷한 티저</p>
              <div className="grid grid-cols-2 gap-3">
                {similar.slice(0, 4).map((f) => (
                  <TeaserCard key={f.id} film={f} sizes="300px" />
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.article>
    </div>
  );
}
