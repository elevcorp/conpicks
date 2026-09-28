"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ParamSync } from "@/components/common/ParamSync";
import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, MoreHorizontal, Eye, ThumbsUp, Play, Share2, Bell, Flag, Star } from "lucide-react";
import { WorkCover } from "@/components/common/Covers";
import { VideoOrCover } from "@/components/common/VideoOrCover";
import { Badge } from "@/components/common/Badge";
import { BackButton } from "@/components/common/Nav";
import { Sheet } from "@/components/common/Sheet";
import { ScrollTopButton } from "@/components/common/ScrollTopButton";
import { CommentList } from "./CommentList";
import { EpisodesTab, FirstTab, InfoTab, TicketTab } from "./WorkTabs";
import { useUser } from "@/store/user";
import { useUI, demoToast } from "@/store/ui";
import { workThemeVars } from "@/lib/color";
import { cn } from "@/lib/cn";
import type { Comment, Episode, EpisodeSummary, Film, RankEntry, Webtoon } from "@/lib/types";

const TABS = [
  { key: "first", label: "첫 화 보기" },
  { key: "episodes", label: "회차" },
  { key: "info", label: "정보" },
  { key: "ticket", label: "이용권" },
  { key: "comments", label: "댓글" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export interface WorkDetailProps {
  work: Webtoon;
  episodes: EpisodeSummary[];
  first: Episode;
  comments: Comment[];
  others: Webtoon[];
  othersLabel: string;
  rank?: RankEntry;
  film?: Film;
}

/** Kakao-style work home with per-work dynamic theme color. */
export function WorkDetail(props: WorkDetailProps) {
  const { work, episodes, first, comments } = props;
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("first");
  const [more, setMore] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const liked = useUser((s) => s.liked.includes(work.id));
  const toggle = useUser((s) => s.toggle);
  const tickets = useUser((s) => (s.rentalTickets[work.id] ?? 0) + (s.ownTickets[work.id] ?? 0));
  const recent = useUser((s) => s.recent.find((r) => r.id === work.id));
  const toast = useUI((s) => s.toast);

  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 420], [1, 1.12]);
  const heroOpacity = useTransform(scrollY, [0, 380], [1, 0.25]);
  const headerBg = useTransform(scrollY, [260, 360], [0, 1]);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => scrollY.on("change", (v) => setCollapsed(v > 330)), [scrollY]);

  const syncTab = useCallback((p: URLSearchParams) => {
    const t = TABS.find((x) => x.key === p.get("tab"))?.key;
    if (t) setTab(t);
  }, []);

  const select = (k: TabKey) => {
    setTab(k);
    router.replace(`/work/${work.id}?tab=${k}`, { scroll: false });
    const el = tabsRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - (window.innerWidth >= 768 ? 64 : 56);
      if (window.scrollY > top) window.scrollTo({ top });
    }
  };

  const onLike = () => toast(toggle("liked", work.id) ? "관심 작품에 추가했어요 · 업데이트 알림을 보내드릴게요" : "관심 작품에서 뺐어요");
  const waitBadge = work.badges.includes("연재무료") ? "연재무료" : work.badges.includes("기다무") ? "기다무" : null;
  const continueEp = recent?.ep ?? 1;
  const nextOfFirst = episodes[1];

  return (
    <div className="work-theme min-h-dvh" style={workThemeVars(work.themeColor)}>
      <ParamSync onChange={syncTab} />
      {/* ---------- mobile fixed header */}
      <header className="fixed inset-x-0 top-0 z-40 md:hidden" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <motion.div className="absolute inset-0 bg-w-solid" style={{ opacity: headerBg }} />
        <div className={cn("relative flex h-14 items-center gap-1 px-4 transition-colors", collapsed ? "text-w-fg" : "text-white")}>
          <BackButton fallback="/" className="hover:bg-white/10" />
          <motion.p className="flex-1 truncate text-[16px] font-bold" style={{ opacity: headerBg }}>
            {work.title}
          </motion.p>
          <button onClick={onLike} aria-label="관심" className="grid size-10 place-items-center rounded-full">
            <motion.span key={String(liked)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
              <Heart size={23} className={cn(liked && "fill-up text-up")} />
            </motion.span>
          </button>
          <button onClick={() => setMore(true)} aria-label="더보기" className="-mr-2 grid size-10 place-items-center rounded-full">
            <MoreHorizontal size={23} />
          </button>
        </div>
      </header>

      {/* ---------- mobile hero */}
      <div className="md:hidden">
        <div ref={heroRef} className="relative h-[min(112vw,560px)] overflow-hidden">
          <motion.div className="absolute inset-0" style={{ scale: heroScale, opacity: heroOpacity }}>
            <VideoOrCover name={`cover_${work.id}`} className="absolute inset-0">
              <WorkCover work={work} className="absolute inset-0" sizes="100vw" priority />
            </VideoOrCover>
          </motion.div>
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: "linear-gradient(to top, var(--w-top), transparent)" }} />
          <div className="absolute left-4 top-[calc(62px+env(safe-area-inset-top))] flex gap-1">
            {waitBadge && <Badge label={waitBadge} />}
            <Badge className="bg-black/55 text-white backdrop-blur">이용권 {tickets}장</Badge>
          </div>
        </div>
        <TitleBlock work={work} className="-mt-10 px-6" />
      </div>

      {/* ---------- body: desktop 2-col, mobile stacked */}
      <div className="mx-auto max-w-[1200px] md:grid md:grid-cols-[280px_minmax(0,1fr)] md:gap-10 md:px-6 md:pt-24 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden md:block">
          <div className="sticky top-24 pb-10">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.45)] ring-1 ring-w-line">
              <VideoOrCover name={`cover_${work.id}`} className="absolute inset-0">
                <WorkCover work={work} showTitle className="absolute inset-0" sizes="340px" priority />
              </VideoOrCover>
              <div className="absolute left-3 top-3 flex gap-1">
                {waitBadge && <Badge label={waitBadge} />}
                <Badge className="bg-black/55 text-white backdrop-blur">이용권 {tickets}장</Badge>
              </div>
            </div>
            <TitleBlock work={work} className="mt-5" />
            <div className="mt-5 flex gap-2">
              <Link href={`/viewer/${work.id}/${continueEp}`} className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand text-[15px] font-bold text-white transition hover:brightness-110">
                <Play size={16} className="fill-white" /> {recent ? `이어보기 ${continueEp}화` : "첫 화 보기"}
              </Link>
              <button onClick={onLike} aria-label="관심" className="grid size-12 place-items-center rounded-xl bg-w-chip transition hover:brightness-110">
                <Heart size={20} className={cn(liked && "fill-up text-up")} />
              </button>
              <button onClick={() => setMore(true)} aria-label="더보기" className="grid size-12 place-items-center rounded-xl bg-w-chip transition hover:brightness-110">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div
            ref={tabsRef}
            className="sticky top-[calc(56px+env(safe-area-inset-top))] z-30 mt-5 border-b border-w-line backdrop-blur-xl md:top-16 md:mt-0"
            style={{ background: "color-mix(in srgb, var(--w-top) 94%, transparent)" }}
          >
            <div className="flex">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => select(t.key)}
                  className={cn("relative h-12 flex-1 text-[15px] font-bold transition-colors md:h-14 md:flex-none md:px-5 md:text-[16px]", tab === t.key ? "text-w-fg" : "text-w-fg3")}
                >
                  {t.label}
                  {t.key === "comments" && <span className="ml-0.5 text-[11px] font-semibold">{compactCount(work.stats.comments)}</span>}
                  {tab === t.key && <motion.span layoutId="work-tab" className="absolute inset-x-2 bottom-0 h-[2.5px] rounded-full bg-w-fg md:inset-x-4" />}
                </button>
              ))}
            </div>
          </div>

          <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="min-h-[70vh] pb-24 md:pb-10">
            {tab === "first" && <FirstTab work={work} episode={first} next={nextOfFirst} />}
            {tab === "episodes" && <EpisodesTab work={work} episodes={episodes} />}
            {tab === "info" && <InfoTab work={work} others={props.others} othersLabel={props.othersLabel} rank={props.rank} film={props.film} />}
            {tab === "ticket" && <TicketTab work={work} />}
            {tab === "comments" && (
              <div className="px-4 pb-10 md:px-0">
                <CommentList workId={work.id} comments={comments} total={work.stats.comments} themed />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {tab === "first" && <ScrollTopButton threshold={900} />}

      {/* mobile bottom CTA */}
      {tab !== "first" && tab !== "episodes" && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-w-line px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl md:hidden" style={{ background: "color-mix(in srgb, var(--w-bottom) 92%, transparent)" }}>
          <Link href={`/viewer/${work.id}/${continueEp}`} className="flex h-[50px] items-center justify-center gap-1.5 rounded-xl bg-brand text-[16px] font-bold text-white">
            <Play size={16} className="fill-white" /> {recent ? `이어보기 ${continueEp}화` : "첫 화 보기"}
          </Link>
        </div>
      )}

      <Sheet open={more} onClose={() => setMore(false)}>
        <ul className="py-3">
          {[
            { i: Share2, t: "공유하기", a: () => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); toast("작품 링크를 복사했어요", "success"); } },
            { i: Bell, t: "업데이트 알림 받기", a: () => toast("매주 업데이트 알림을 보내드릴게요", "success") },
            { i: Star, t: "작품 별점 주기", a: () => demoToast("별점은 회차 끝에서 줄 수 있어요") },
            { i: Flag, t: "작품 신고", a: () => demoToast("신고가 접수되었어요") },
          ].map(({ i: I, t, a }) => (
            <li key={t}>
              <button onClick={() => { setMore(false); a(); }} className="flex h-14 w-full items-center gap-3 text-[16px] font-semibold">
                <I size={20} className="text-fg-2" /> {t}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  );
}

function compactCount(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString();
}

function TitleBlock({ work, className }: { work: Webtoon; className?: string }) {
  return (
    <div className={cn("relative text-center md:text-left", className)}>
      <h1 className="text-balance text-[27px] font-black leading-tight tracking-tight md:text-[26px]">{work.title}</h1>
      <p className="mt-1.5 text-[14px] text-w-fg2">{work.author}</p>
      <p className="mt-1.5 flex items-center justify-center gap-2 text-[13px] text-w-fg2 md:justify-start">
        <span>{work.genre}</span>
        <span className="flex items-center gap-0.5"><Eye size={13} />{work.views}</span>
        <span className="flex items-center gap-0.5"><ThumbsUp size={13} />{work.likes}</span>
        <span className="flex items-center gap-0.5"><Star size={13} className="fill-free text-free" />{work.rating.toFixed(2)}</span>
      </p>
    </div>
  );
}
