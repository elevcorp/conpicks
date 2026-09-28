"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, Star, List, Clock, Coins, Ticket, Lock, X, Play,
} from "lucide-react";
import { EpisodeReader } from "./EpisodeReader";
import { EpThumb } from "./WorkTabs";
import { CommentList } from "./CommentList";
import { Sheet } from "@/components/common/Sheet";
import { ScrollTopButton } from "@/components/common/ScrollTopButton";
import { useUser, isUnlocked } from "@/store/user";
import { useUI } from "@/store/ui";
import { compact, won } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Comment, Episode, EpisodeSummary, Webtoon } from "@/lib/types";

interface Props {
  work: Webtoon;
  episode: Episode;
  prev?: EpisodeSummary;
  next?: EpisodeSummary;
  total: number;
  comments: Comment[];
}

export function Viewer({ work, episode, prev, next, total, comments }: Props) {
  const router = useRouter();
  const purchased = useUser((s) => s.purchased);
  const addRecent = useUser((s) => s.addRecent);
  const unlocked = episode.status === "free" || isUnlocked(purchased, work.id, episode.ep);
  const nextUnlocked = !!next && (next.status === "free" || isUnlocked(purchased, work.id, next.ep));

  const [bars, setBars] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [buyTarget, setBuyTarget] = useState<EpisodeSummary | null>(null);
  const lastY = useRef(0);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    if (unlocked) addRecent(work.id, episode.ep);
  }, [unlocked, work.id, episode.ep, addRecent]);

  // hide bars on scroll down, show on scroll up / at the end
  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      const atEnd = window.innerHeight + y >= document.body.scrollHeight - 40;
      if (y < 60 || atEnd) setBars(true);
      else if (y > lastY.current + 6) setBars(false);
      else if (y < lastY.current - 6) setBars(true);
      lastY.current = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // keyboard: ↑↓ scroll, ←→ episodes (space scrolls natively)
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowDown") { e.preventDefault(); window.scrollBy({ top: 320, behavior: "smooth" }); }
      if (e.key === "ArrowUp") { e.preventDefault(); window.scrollBy({ top: -320, behavior: "smooth" }); }
      if (e.key === "ArrowLeft" && prev) router.push(`/viewer/${work.id}/${prev.ep}`);
      if (e.key === "ArrowRight" && next) router.push(`/viewer/${work.id}/${next.ep}`);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [prev, next, router, work.id]);

  const current: EpisodeSummary = episode;

  return (
    <div className="min-h-dvh bg-[#050505]">
      {/* top bar */}
      <motion.header
        className="fixed inset-x-0 top-0 z-40 mx-auto max-w-[720px] border-b border-line bg-[var(--nav)] backdrop-blur-xl"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        animate={{ y: bars ? 0 : "-110%" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="flex h-[52px] items-center gap-1 px-3">
          <Link href={`/work/${work.id}?tab=episodes`} aria-label="뒤로가기" className="grid size-10 place-items-center rounded-full hover:bg-chip">
            <ChevronLeft size={26} />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[15px] font-bold">{work.title}</p>
            <p className="truncate text-[12px] text-fg-3">{episode.title}</p>
          </div>
          <LikeWork id={work.id} />
        </div>
      </motion.header>

      <main className="mx-auto min-h-dvh max-w-[720px] bg-bg pb-20 pt-[calc(52px+env(safe-area-inset-top))] shadow-[0_0_80px_rgba(0,0,0,0.6)]">
        {unlocked ? (
          <>
            <div onClick={() => setBars((b) => !b)}>
              <EpisodeReader work={work} episode={episode} />
            </div>
            <EndOfEpisode
              work={work}
              episode={episode}
              next={next}
              nextUnlocked={nextUnlocked}
              onComments={() => setCommentsOpen(true)}
              onRate={() => setRateOpen(true)}
              onBuy={setBuyTarget}
              comments={comments}
            />
          </>
        ) : (
          <LockedGate work={work} episode={current} onBuy={() => setBuyTarget(current)} />
        )}
      </main>

      {/* bottom toolbar + progress */}
      <motion.nav
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[720px] border-t border-line bg-[var(--nav)] backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        animate={{ y: bars ? 0 : "calc(100% - 3px)" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <motion.div className="absolute inset-x-0 top-0 h-[3px] origin-left bg-brand" style={{ scaleX: progress }} />
        <div className="flex h-[54px] items-center justify-between px-2 text-[13px] font-semibold">
          <EpNav work={work} ep={prev} dir="prev" />
          <button onClick={() => setCommentsOpen(true)} className="flex h-10 items-center gap-1.5 rounded-full px-3 hover:bg-chip">
            <MessageCircle size={18} /> {won(episode.comments)}
          </button>
          <Link href={`/work/${work.id}?tab=episodes`} className="flex h-10 items-center gap-1.5 rounded-full px-3 hover:bg-chip">
            <List size={18} /> {episode.ep}/{total}
          </Link>
          <EpNav work={work} ep={next} dir="next" locked={!!next && !nextUnlocked} onLocked={() => next && setBuyTarget(next)} />
        </div>
      </motion.nav>

      <ScrollTopButton className="bottom-[calc(80px+env(safe-area-inset-bottom))] md:right-[max(24px,calc(50vw-360px-72px))]" />

      <Sheet open={commentsOpen} onClose={() => setCommentsOpen(false)} title={`${episode.ep}화 댓글`} className="md:max-w-[560px]">
        <CommentList workId={work.id} comments={comments} total={episode.comments} defaultEpisode={`${episode.ep}화`} />
      </Sheet>
      <RateSheet open={rateOpen} onClose={() => setRateOpen(false)} rkey={`${work.id}:${episode.ep}`} base={episode.rating} />
      <PurchaseModal work={work} target={buyTarget} onClose={() => setBuyTarget(null)} />
    </div>
  );
}

function LikeWork({ id }: { id: string }) {
  const liked = useUser((s) => s.liked.includes(id));
  const toggle = useUser((s) => s.toggle);
  const toast = useUI((s) => s.toast);
  return (
    <button onClick={() => toast(toggle("liked", id) ? "관심 작품에 추가했어요" : "관심 작품에서 뺐어요")} aria-label="관심" className="grid size-10 place-items-center rounded-full hover:bg-chip">
      <Heart size={22} className={cn(liked && "fill-up text-up")} />
    </button>
  );
}

function EpNav({ work, ep, dir, locked, onLocked }: { work: Webtoon; ep?: EpisodeSummary; dir: "prev" | "next"; locked?: boolean; onLocked?: () => void }) {
  const label = dir === "prev" ? "이전화" : "다음화";
  const content = (
    <>
      {dir === "prev" && <ChevronLeft size={18} />}
      {locked && <Lock size={13} />}
      {label}
      {dir === "next" && <ChevronRight size={18} />}
    </>
  );
  if (!ep) return <span className="flex h-10 items-center gap-0.5 px-3 text-fg-3/50">{content}</span>;
  if (locked) return <button onClick={onLocked} className="flex h-10 items-center gap-0.5 rounded-full px-3 hover:bg-chip">{content}</button>;
  return <Link href={`/viewer/${work.id}/${ep.ep}`} className="flex h-10 items-center gap-0.5 rounded-full px-3 hover:bg-chip">{content}</Link>;
}

/* ------------------------------------------------------------ end of episode */
function EndOfEpisode({ work, episode, next, nextUnlocked, onComments, onRate, onBuy, comments }: {
  work: Webtoon; episode: Episode; next?: EpisodeSummary; nextUnlocked: boolean;
  onComments: () => void; onRate: () => void; onBuy: (e: EpisodeSummary) => void; comments: Comment[];
}) {
  const key = `${work.id}:${episode.ep}`;
  const liked = useUser((s) => s.epLikes.includes(key));
  const rated = useUser((s) => s.ratings[key]);
  const toggle = useUser((s) => s.toggle);
  const toast = useUI((s) => s.toast);

  const actions = [
    { icon: Heart, label: compact(episode.likes + (liked ? 1 : 0)), active: liked, on: () => toggle("epLikes", key) },
    { icon: MessageCircle, label: `댓글 ${won(episode.comments)}`, on: onComments },
    { icon: Share2, label: "공유", on: () => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); toast("회차 링크를 복사했어요", "success"); } },
    { icon: Star, label: rated ? `${rated}점` : "별점주기", active: !!rated, on: onRate },
  ];

  return (
    <section className="px-4 pb-10">
      <div className="grid grid-cols-4 gap-2">
        {actions.map(({ icon: I, label, active, on }) => (
          <motion.button
            key={label + String(active)}
            whileTap={{ scale: 0.92 }}
            onClick={on}
            className={cn("flex flex-col items-center gap-1.5 rounded-2xl bg-elev py-3.5 text-[12.5px] font-semibold", active && "text-brand")}
          >
            <I size={22} className={cn(active && I === Heart && "fill-up text-up", active && I === Star && "fill-free text-free")} />
            {label}
          </motion.button>
        ))}
      </div>

      <div className="mt-8">
        {next ? (
          nextUnlocked ? (
            <Link href={`/viewer/${work.id}/${next.ep}`} className="group flex items-center gap-3 rounded-2xl bg-elev p-3 transition hover:bg-elev-2">
              <div className="relative aspect-video w-[132px] shrink-0 overflow-hidden rounded-lg">
                <EpThumb work={work} ep={next.ep} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-brand">다음화 {next.status === "wait" && "· 대여중"}</p>
                <p className="truncate text-[15px] font-bold">{next.title}</p>
                <p className="text-[12px] text-fg-3">{next.date}</p>
              </div>
              <ChevronRight className="text-fg-3" />
            </Link>
          ) : (
            <Paywall work={work} ep={next} onBuy={() => onBuy(next)} />
          )
        ) : (
          <div className="rounded-2xl bg-elev px-5 py-6 text-center">
            <p className="text-[16px] font-bold">최신화까지 모두 봤어요!</p>
            <p className="mt-1 text-[13px] text-fg-3">
              {work.status === "completed" ? "완결된 작품이에요. 여운이 남는다면 댓글을 남겨주세요." : `다음 화는 ${work.weekdays[0]}요일에 업데이트돼요`}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[15px] font-bold">BEST 댓글</p>
          <button onClick={onComments} className="text-[13px] font-semibold text-fg-3">전체보기</button>
        </div>
        {comments.filter((c) => c.isBest).slice(0, 2).map((c) => (
          <button key={c.id} onClick={onComments} className="mb-2 block w-full rounded-2xl bg-elev px-4 py-3 text-left">
            <p className="text-[13px] font-bold">{c.nickname} <span className="ml-1 font-normal text-fg-3">좋아요 {won(c.likes)}</span></p>
            <p className="mt-1 line-clamp-2 text-[14px] text-fg-2">{c.body}</p>
          </button>
        ))}
      </div>
      <Link href={`/work/${work.id}`} className="mt-4 flex h-12 items-center justify-center rounded-xl border border-line text-[14px] font-semibold text-fg-2">
        작품홈으로
      </Link>
    </section>
  );
}

/** Blurred next-episode thumbnail + preview paywall card. */
function Paywall({ work, ep, onBuy, title = "다음 화 미리보기" }: { work: Webtoon; ep: EpisodeSummary; onBuy: () => void; title?: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="absolute inset-0 scale-110 blur-xl brightness-75">
        <EpThumb work={work} ep={ep.ep} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-black/80" />
      <div className="relative px-5 pb-6 pt-24 text-center text-white">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-white/15 backdrop-blur">
          <Lock size={20} />
        </span>
        <p className="mt-3 text-[14px] font-semibold text-white/80">{title}</p>
        <p className="mt-1 text-[21px] font-extrabold">
          {ep.ep}화 · 캐시 {ep.price}
        </p>
        <p className="mt-1 truncate text-[13px] text-white/70">{ep.title}</p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onBuy}
          className="mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-brand text-[17px] font-bold shadow-[0_10px_30px_rgba(49,130,246,0.45)]"
        >
          <Play size={17} className="fill-white" /> 미리보기로 이어보기
        </motion.button>
        <p className="mt-3 flex items-center justify-center gap-1 text-[13px] text-white/75">
          <Clock size={13} /> 무료 공개까지 D-{ep.waitDays} · 기다리면 무료
        </p>
      </div>
    </div>
  );
}

function LockedGate({ work, episode, onBuy }: { work: Webtoon; episode: EpisodeSummary; onBuy: () => void }) {
  return (
    <div className="px-4 pt-6">
      <Paywall work={work} ep={episode} onBuy={onBuy} title="아직 무료 공개 전인 회차예요" />
      <p className="mt-5 text-center text-[13px] leading-relaxed text-fg-3">
        미리보기로 먼저 보거나, {episode.waitDays}일 기다리면 무료로 볼 수 있어요.
        <br />
        <Link href={`/work/${work.id}?tab=episodes`} className="mt-2 inline-block font-semibold text-fg-2 underline underline-offset-4">
          회차 목록으로
        </Link>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ purchase */
function PurchaseModal({ work, target, onClose }: { work: Webtoon; target: EpisodeSummary | null; onClose: () => void }) {
  const router = useRouter();
  const cash = useUser((s) => s.cash);
  const tickets = useUser((s) => s.rentalTickets[work.id] ?? 0);
  const { purchase, useTicket: spendTicket } = useUser();
  const { setCashSheet, toast } = useUI();
  const [done, setDone] = useState(false);
  // Balance frozen at the moment of payment so the summary shows before → after, not a recomputation.
  const [paidFrom, setPaidFrom] = useState<{ cash: number; via: "cash" | "ticket" } | null>(null);

  useEffect(() => {
    if (target) {
      setDone(false);
      setPaidFrom(null);
    }
  }, [target]);

  const price = target?.price ?? 300;
  const balance = paidFrom?.cash ?? cash;
  const enough = balance >= price;

  const pay = (via: "cash" | "ticket") => {
    if (!target) return;
    const before = cash;
    const ok = via === "cash" ? purchase(work.id, target.ep, price) : spendTicket(work.id, target.ep);
    if (ok) setPaidFrom({ cash: before, via });
    finish(ok, via === "cash" ? `캐시 ${price} 사용` : "대여권 1장 사용");
  };

  const finish = (ok: boolean, how: string) => {
    if (!ok || !target) return;
    setDone(true);
    toast(`${target.ep}화 미리보기가 열렸어요 · ${how}`, "success");
    window.setTimeout(() => {
      onClose();
      router.push(`/viewer/${work.id}/${target.ep}`);
      window.scrollTo({ top: 0 });
    }, 650);
  };

  return (
    <AnimatePresence>
      {target && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
          <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal
            className="relative w-full max-w-[360px] rounded-[24px] bg-elev p-5 text-fg shadow-2xl"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 26, stiffness: 380 }}
          >
            <button onClick={onClose} aria-label="닫기" className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-fg-3 hover:bg-chip">
              <X size={18} />
            </button>
            <p className="text-[18px] font-bold">미리보기</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="relative aspect-video w-[96px] shrink-0 overflow-hidden rounded-lg">
                <EpThumb work={work} ep={target.ep} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] text-fg-3">{work.title}</p>
                <p className="truncate text-[15px] font-bold">{target.title}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 rounded-2xl bg-chip px-4 py-3.5 text-[14px]">
              <div className="flex justify-between"><span className="text-fg-2">보유 캐시</span><span className="font-semibold">{won(balance)}</span></div>
              <div className="flex justify-between"><span className="text-fg-2">미리보기</span><span className="font-semibold text-up">{paidFrom?.via === "ticket" ? "대여권 1장" : `− ${won(price)}`}</span></div>
              <div className="flex justify-between border-t border-line pt-2.5">
                <span className="font-semibold">결제 후 잔액</span>
                <AnimatePresence mode="wait">
                  <motion.span key={balance} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={cn("font-extrabold", enough || paidFrom ? "text-brand" : "text-up")}>
                    {paidFrom?.via === "ticket" ? `${won(balance)} (변동 없음)` : enough ? `${won(balance)} → ${won(balance - price)}` : "캐시 부족"}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {done ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-5 flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#1fb86a] text-[16px] font-bold text-white">
                결제 완료 · 이동 중…
              </motion.div>
            ) : enough ? (
              <button onClick={() => pay("cash")} className="mt-5 flex h-[52px] w-full items-center justify-center gap-1.5 rounded-2xl bg-brand text-[16px] font-bold text-white">
                <Coins size={18} /> {price}캐시로 보기
              </button>
            ) : (
              <button onClick={() => setCashSheet(true)} className="mt-5 flex h-[52px] w-full items-center justify-center gap-1.5 rounded-2xl bg-brand text-[16px] font-bold text-white">
                <Coins size={18} /> 캐시 충전하기
              </button>
            )}
            {tickets > 0 && !done && (
              <button onClick={() => pay("ticket")} className="mt-2 flex h-12 w-full items-center justify-center gap-1.5 rounded-2xl bg-chip text-[15px] font-bold">
                <Ticket size={17} /> 대여권 1장 사용 (보유 {tickets}장)
              </button>
            )}
            <p className="mt-3 text-center text-[12px] text-fg-3">무료 공개까지 D-{target.waitDays} · 시연 모드 결제</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function RateSheet({ open, onClose, rkey, base }: { open: boolean; onClose: () => void; rkey: string; base: number }) {
  const current = useUser((s) => s.ratings[rkey]);
  const rate = useUser((s) => s.rate);
  const toast = useUI((s) => s.toast);
  const [v, setV] = useState(current ?? 10);
  return (
    <Sheet open={open} onClose={onClose} title="이번 화 별점">
      <p className="-mt-1 text-[13px] text-fg-3">평균 ★ {base.toFixed(2)}</p>
      <div className="my-6 flex justify-center gap-1.5">
        {[2, 4, 6, 8, 10].map((n) => (
          <motion.button key={n} whileTap={{ scale: 0.85 }} onClick={() => setV(n)} aria-label={`${n}점`}>
            <Star size={40} className={cn(n <= v ? "fill-free text-free" : "text-fg-3")} />
          </motion.button>
        ))}
      </div>
      <p className="text-center text-[28px] font-black">{v}점</p>
      <button
        onClick={() => { rate(rkey, v); onClose(); toast(`별점 ${v}점을 남겼어요`, "success"); }}
        className="mb-2 mt-5 h-[52px] w-full rounded-2xl bg-brand text-[16px] font-bold text-white"
      >
        별점 남기기
      </button>
    </Sheet>
  );
}
