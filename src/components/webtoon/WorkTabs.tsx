"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown, ChevronRight, Clock, Play, Heart, Share2, Bookmark, MessageCircle, Check, Ticket, ArrowUpDown, ArrowUp, Film, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { WorkCover, FilmCover } from "@/components/common/Covers";
import { SceneArt } from "@/components/common/SceneArt";
import { RankDelta } from "@/components/common/RankDelta";
import { Sheet } from "@/components/common/Sheet";
import { useWorldNav } from "@/components/common/useWorldNav";
import { useRequireLogin } from "@/components/common/LoginSheet";
import { EpisodeReader } from "./EpisodeReader";
import { useUser, isUnlocked } from "@/store/user";
import { useUI, demoToast } from "@/store/ui";
import { cutSrc } from "@/lib/assets";
import { compact, won } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Episode, EpisodeSummary, Film as FilmT, RankEntry, Webtoon } from "@/lib/types";

/* ------------------------------------------------------------------ 첫 화 보기 */
export function FirstTab({ work, episode, next }: { work: Webtoon; episode: Episode; next?: EpisodeSummary }) {
  return (
    <div>
      <div className="px-4 pt-5 md:px-0">
        <div className="flex gap-1">
          <Badge label="연재" />
          <Badge className="bg-w-chip text-w-fg">{work.status === "completed" ? "완결" : work.weekdays.join("·")}</Badge>
          <Badge className="bg-w-chip text-w-fg">{work.ageRating}</Badge>
        </div>
        <Synopsis text={work.synopsis} className="mt-3" />
      </div>
      <div className="mt-2">
        <EpisodeReader work={work} episode={episode} />
      </div>
      {next && (
        <div className="px-4 pb-10 md:px-0">
          <Link href={`/viewer/${work.id}/${next.ep}`} className="flex items-center gap-3 rounded-2xl bg-w-surface p-3 ring-1 ring-w-line transition hover:brightness-110">
            <div className="relative aspect-video w-[116px] shrink-0 overflow-hidden rounded-lg">
              <EpThumb work={work} ep={next.ep} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-w-fg3">다음화</p>
              <p className="truncate text-[15px] font-bold">{next.title}</p>
            </div>
            <span className="flex h-10 items-center gap-1 rounded-full bg-brand px-4 text-[14px] font-bold text-white">
              <Play size={14} className="fill-white" /> 보기
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

export function Synopsis({ text, className }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen((o) => !o)} className={cn("block w-full rounded-2xl bg-w-surface px-4 py-3.5 text-left", className)}>
      <p className={cn("whitespace-pre-line text-[14px] leading-[1.7] text-w-fg2", !open && "line-clamp-3")} style={{ wordBreak: "keep-all" }}>
        {text}
      </p>
      <span className="mt-1 flex justify-center text-w-fg3">
        <ChevronDown size={18} className={cn("transition-transform", open && "rotate-180")} />
      </span>
    </button>
  );
}

export function EpThumb({ work, ep }: { work: Webtoon; ep: number }) {
  const real = cutSrc(work.id, ((ep - 1) % 8) + 1);
  if (real) return <Image src={real} alt="" fill sizes="200px" className="object-cover" />;
  return <SceneArt seed={`${work.id}-thumb-${ep}`} theme={work.themeColor} genre={work.genreKey} variant="wide" mode={(["scene", "closeup", "scene", "scene", "impact"] as const)[ep % 5]} className="absolute inset-0 h-full w-full" />;
}

/* ------------------------------------------------------------------ 회차 */
export function EpisodesTab({ work, episodes }: { work: Webtoon; episodes: EpisodeSummary[] }) {
  const [desc, setDesc] = useState(true);
  const [limit, setLimit] = useState(30);
  const purchased = useUser((s) => s.purchased);
  const toast = useUI((s) => s.toast);
  const list = useMemo(() => (desc ? [...episodes].reverse() : episodes), [episodes, desc]);
  const waitCount = episodes.filter((e) => e.status === "wait").length;

  return (
    <div className="px-4 pt-4 md:px-0">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[14px] font-bold">
          총 {episodes.length}화 <span className="font-medium text-w-fg3">· {desc ? "최신화부터" : "1화부터"}</span>
        </p>
        {waitCount > 0 && (
          <span className="flex items-center gap-1 text-[12px] font-semibold text-w-fg2">
            <Clock size={13} /> 기다리면 무료 · 미리보기 {waitCount}화
          </span>
        )}
      </div>
      <ul className="grid grid-cols-3 gap-x-2 gap-y-4 md:gap-x-3 md:gap-y-5">
        {list.slice(0, limit).map((e) => {
          const owned = isUnlocked(purchased, work.id, e.ep);
          return (
            <li key={e.ep}>
              <Link href={`/viewer/${work.id}/${e.ep}`} className="group block">
                <div className="relative aspect-video overflow-hidden rounded-md bg-w-surface">
                  <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                    <EpThumb work={work} ep={e.ep} />
                  </div>
                  {e.status === "free" && <Badge label="무료" className="absolute left-1 top-1" />}
                  {e.status === "wait" && !owned && (
                    <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/65 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                      <Clock size={11} /> {e.waitDays}일 후 무료
                    </span>
                  )}
                  {owned && <Badge tone="brand" className="absolute left-1 top-1">대여중</Badge>}
                </div>
                <p className="mt-1.5 line-clamp-2 text-[13px] font-semibold leading-snug">{e.title}</p>
                <p className="mt-0.5 text-[11.5px] text-w-fg3">{e.status === "wait" && !owned ? `미리보기 · ${e.price}캐시` : e.date}</p>
              </Link>
            </li>
          );
        })}
      </ul>
      {limit < list.length && (
        <button onClick={() => setLimit((l) => l + 30)} className="mt-6 flex h-12 w-full items-center justify-center gap-1 rounded-xl bg-w-surface text-[14px] font-semibold">
          회차 더보기 ({list.length - limit}) <ChevronDown size={16} />
        </button>
      )}
      <div className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col gap-2 md:right-[max(24px,calc(50vw-600px))]">
        <button
          onClick={() => {
            setDesc((d) => !d);
            toast(desc ? "1화부터 정렬했어요" : "최신화부터 정렬했어요");
          }}
          aria-label="정렬"
          className="grid size-12 place-items-center rounded-full bg-[#2b2f36]/90 text-white shadow-lg ring-1 ring-white/10 backdrop-blur"
        >
          <ArrowUpDown size={20} />
        </button>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="맨위로" className="grid size-12 place-items-center rounded-full bg-[#2b2f36]/90 text-white shadow-lg ring-1 ring-white/10 backdrop-blur">
          <ArrowUp size={20} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ 정보 */
const IP_STEPS = ["연재중", "지무비 리뷰", "영상화 검토", "AI영화 제작"];

export function InfoTab({ work, others, othersLabel, rank, film }: {
  work: Webtoon; others: Webtoon[]; othersLabel: string; rank?: RankEntry; film?: FilmT;
}) {
  const [review, setReview] = useState(false);
  const go = useWorldNav();

  useEffect(() => {
    if (window.location.hash === "#review") {
      const t = window.setTimeout(() => document.getElementById("review")?.scrollIntoView({ behavior: "smooth", block: "center" }), 350);
      return () => window.clearTimeout(t);
    }
  }, []);

  return (
    <div className="space-y-7 px-4 pb-16 pt-5 md:px-0">
      <div className="flex gap-1">
        <Badge label="연재" />
        <Badge className="bg-w-chip text-w-fg">{work.status === "completed" ? "완결" : `${work.weekdays.join("·")} 연재`}</Badge>
        {work.league === "league" && <Badge label="리그" />}
      </div>

      <table className="w-full text-[14px]">
        <tbody>
          {[
            ["글", work.writer],
            ["그림", work.artist],
            ["발행처", work.publisher],
            ["연령", `${work.ageRating} 이용가`],
          ].map(([k, v]) => (
            <tr key={k}>
              <th className="w-16 py-1.5 text-left font-medium text-w-fg3">{k}</th>
              <td className="py-1.5 font-semibold">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Synopsis text={work.synopsis} />

      <div className="flex flex-wrap gap-1.5">
        {work.keywords.map((k) => (
          <Link key={k} href={`/search?q=${encodeURIComponent(k)}`} className="rounded-full bg-w-chip px-3 py-1.5 text-[13px] font-semibold">
            #{k}
          </Link>
        ))}
      </div>

      {/* 검증 데이터 */}
      <section>
        <h3 className="mb-2.5 flex items-center gap-1.5 text-[16px] font-bold">
          검증 데이터 <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">CNPX</span>
        </h3>
        <div className="rounded-2xl bg-w-surface p-4 ring-1 ring-w-line">
          <div className="flex items-center justify-between border-b border-w-line pb-3">
            <span className="text-[13px] text-w-fg2">{work.league === "league" ? "신작 리그 실시간 순위" : "정식 연재 실시간 순위"}</span>
            <span className="flex items-center gap-2 text-[20px] font-black">
              {rank ? `${rank.rank}위` : "집계중"}
              {rank && <RankDelta change={rank.change} />}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-3 text-center">
            {[
              { i: Heart, l: "좋아요", v: work.stats.likes },
              { i: Share2, l: "공유", v: work.stats.shares },
              { i: Bookmark, l: "저장", v: work.stats.saves },
              { i: MessageCircle, l: "댓글", v: work.stats.comments },
            ].map(({ i: I, l, v }) => (
              <div key={l}>
                <I size={16} className="mx-auto text-w-fg2" />
                <p className="mt-1 text-[16px] font-extrabold">{compact(v)}</p>
                <p className="text-[11px] text-w-fg3">{l}</p>
              </div>
            ))}
          </div>
          {work.league === "league" && (
            <div className="mt-3 border-t border-w-line pt-3">
              <div className="mb-1 flex justify-between text-[12px] font-semibold"><span className="text-w-fg2">정식 연재까지</span><span className="text-brand">{work.leagueProgress}%</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-w-chip"><div className="h-full rounded-full bg-brand" style={{ width: `${work.leagueProgress}%` }} /></div>
            </div>
          )}
        </div>
      </section>

      {/* IP 확장 */}
      <section>
        <h3 className="mb-2.5 text-[16px] font-bold">IP 확장 현황</h3>
        <ol className="relative flex justify-between rounded-2xl bg-w-surface px-3 py-4 ring-1 ring-w-line">
          <div className="absolute left-[12.5%] right-[12.5%] top-[27px] h-[2px] bg-w-line" />
          <motion.div
            className="absolute left-[12.5%] top-[27px] h-[2px] bg-brand"
            initial={{ width: 0 }}
            whileInView={{ width: `${((work.ipStage - 1) / 3) * 75}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          />
          {IP_STEPS.map((s, i) => {
            const done = i < work.ipStage;
            const current = i === work.ipStage - 1;
            return (
              <li key={s} className="relative z-10 flex w-1/4 flex-col items-center text-center">
                <span className={cn("grid size-6 place-items-center rounded-full text-[11px] font-bold", done ? "bg-brand text-white" : "bg-w-chip text-w-fg3", current && "ring-4 ring-brand/30")}>
                  {done ? <Check size={13} strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn("mt-1.5 text-[11.5px] font-semibold", done ? "text-w-fg" : "text-w-fg3")}>{s}</span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 지무비 리뷰 */}
      {work.jimovieReview && (
        <section id="review" className="scroll-mt-32">
          <h3 className="mb-2.5 flex items-center gap-1.5 text-[16px] font-bold">
            지무비 리뷰 <Sparkles size={15} className="text-free" />
          </h3>
          <button onClick={() => setReview(true)} className="group block w-full overflow-hidden rounded-2xl bg-black text-left ring-1 ring-w-line">
            <div className="relative aspect-video">
              <WorkCover work={work} variant="wide" className="absolute inset-0 opacity-80 transition-transform duration-700 group-hover:scale-105" sizes="720px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
              <span className="absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-white">지무비 · 공식 리뷰</span>
              <span className="absolute inset-0 m-auto grid size-16 place-items-center rounded-full bg-white/90 text-black shadow-xl transition-transform group-hover:scale-110">
                <Play size={26} className="ml-1 fill-black" />
              </span>
              <span className="absolute bottom-3 right-3 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">{work.jimovieReview.duration}</span>
            </div>
            <div className="p-3.5 text-white">
              <p className="line-clamp-2 text-[15px] font-bold">[지무비] {work.jimovieReview.title}</p>
              <p className="mt-1 text-[12.5px] text-white/60">리뷰 조회수 {work.jimovieReview.views}회 · {work.jimovieReview.date}</p>
            </div>
          </button>
        </section>
      )}

      {/* 영화 월드 크로스링크 */}
      {film && (
        <section>
          <h3 className="mb-2.5 text-[16px] font-bold">이 작품의 AI 영화 티저</h3>
          <button onClick={() => go(`/film/work/${film.id}`)} className="group flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-[#0A0D1C] p-3 text-left text-white ring-1 ring-white/10">
            <div className="relative aspect-video w-[140px] shrink-0 overflow-hidden rounded-lg">
              <FilmCover film={film} className="absolute inset-0 transition-transform duration-500 group-hover:scale-110" sizes="140px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-[11px] font-bold text-[#7db3ff]"><Film size={12} /> AI 영화 월드 · 시즌{film.season} {film.rank}위</p>
              <p className="mt-0.5 truncate text-[15px] font-bold">{film.title}</p>
              <p className="mt-0.5 text-[12px] text-white/60">{film.runtime} · 좋아요 {compact(film.stats.likes)}</p>
            </div>
            <ChevronRight size={20} className="text-white/50" />
          </button>
        </section>
      )}

      {/* 작가의 다른 작품 */}
      {others.length > 0 && (
        <section>
          <h3 className="mb-2.5 text-[16px] font-bold">{othersLabel}</h3>
          <div className="snap-row -mx-4 gap-2.5 px-4 md:mx-0 md:px-0">
            {others.map((o) => (
              <Link key={o.id} href={`/work/${o.id}`} className="w-[30vw] max-w-[140px]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                  <WorkCover work={o} className="absolute inset-0" sizes="140px" />
                </div>
                <p className="mt-1.5 truncate text-[13px] font-semibold">{o.title}</p>
                <p className="truncate text-[11.5px] text-w-fg3">{o.writer}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Sheet open={review} onClose={() => setReview(false)} title="지무비 리뷰">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
          <WorkCover work={work} variant="wide" className="absolute inset-0 opacity-60" sizes="440px" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center text-white">
              <Play size={36} className="mx-auto fill-white" />
              <p className="mt-2 text-[13px] font-semibold">리뷰 영상 미리보기</p>
            </div>
          </div>
          <motion.div className="absolute bottom-0 left-0 h-1 bg-brand" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 12, ease: "linear" }} />
        </div>
        <p className="mt-3 text-[15px] font-bold">[지무비] {work.jimovieReview?.title}</p>
        <p className="mt-1 text-[13px] text-fg-3">조회수 {work.jimovieReview?.views}회 · 리뷰 이후 이 작품의 신규 독자 +312%</p>
        <p className="mb-2 mt-4 rounded-xl bg-chip px-4 py-3 text-[12.5px] text-fg-2">시연 모드 · 정식 오픈 시 실제 리뷰 영상이 연결됩니다</p>
      </Sheet>
    </div>
  );
}

/* ------------------------------------------------------------------ 이용권 */
const TICKET_PRODUCTS = [
  { kind: "rental" as const, count: 1, price: 300, label: "대여권 1장", note: "3일간 감상" },
  { kind: "rental" as const, count: 3, price: 900, label: "대여권 3장", note: "3일간 감상" },
  { kind: "rental" as const, count: 10, price: 2700, label: "대여권 10장", note: "10% 할인" },
  { kind: "own" as const, count: 1, price: 500, label: "소장권 1장", note: "영구 소장" },
];

export function TicketTab({ work }: { work: Webtoon }) {
  const rental = useUser((s) => s.rentalTickets[work.id] ?? 0);
  const own = useUser((s) => s.ownTickets[work.id] ?? 0);
  const { cash, buyTickets } = useUser();
  const { setCashSheet } = useUI();
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(1);
  const requireLogin = useRequireLogin();

  const buy = () => {
    const p = TICKET_PRODUCTS[sel];
    if (!buyTickets(work.id, p.kind, p.count, p.price)) {
      setOpen(false);
      setCashSheet(true);
      return;
    }
    setOpen(false);
    demoToast(`${p.label} 구매 완료 · 캐시 ${won(p.price)} 사용`);
  };

  return (
    <div className="px-4 pb-16 pt-6 md:px-0">
      <div className="flex items-center justify-between rounded-2xl bg-w-surface px-5 py-6 ring-1 ring-w-line">
        <div>
          <p className="text-[14px] text-w-fg2">보유 이용권</p>
          <motion.p key={rental + own} initial={{ scale: 1.2, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="mt-1 text-[36px] font-black leading-none">
            {rental + own}
            <span className="ml-1 text-[18px] font-bold">장</span>
          </motion.p>
        </div>
        <button onClick={() => requireLogin(() => setOpen(true))} className="h-10 rounded-full bg-white px-6 text-[15px] font-bold text-ink shadow">
          구매
        </button>
      </div>
      <ul className="mt-4 px-1">
        {[
          ["대여권", rental],
          ["소장권", own],
        ].map(([k, v]) => (
          <li key={k} className="flex items-center justify-between border-b border-dashed border-w-line py-4 text-[15px]">
            <span className="flex items-center gap-2 text-w-fg2">
              <Ticket size={16} /> {k}
            </span>
            <span className="font-bold">{v}장</span>
          </li>
        ))}
      </ul>
      <ul className="mt-5 space-y-1.5 text-[12.5px] leading-relaxed text-w-fg3">
        <li>· 대여권은 사용 시점부터 3일간 해당 회차를 감상할 수 있어요.</li>
        <li>· 소장권으로 구매한 회차는 기간 제한 없이 볼 수 있어요.</li>
        <li>· 기다리면 무료 회차는 공개일이 지나면 누구나 무료로 감상할 수 있어요.</li>
      </ul>

      <Sheet open={open} onClose={() => setOpen(false)} title="이용권 구매">
        <p className="-mt-1 mb-3 text-[13px] text-fg-3">{work.title} · 보유 캐시 <b className="text-fg">{won(cash)}</b></p>
        <ul className="space-y-2">
          {TICKET_PRODUCTS.map((p, i) => (
            <li key={p.label}>
              <button onClick={() => setSel(i)} className={cn("flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left", sel === i ? "border-brand bg-brand-soft" : "border-line")}>
                <span className={cn("grid size-5 place-items-center rounded-full border", sel === i ? "border-brand bg-brand text-white" : "border-fg-3")}>
                  {sel === i && <Check size={13} strokeWidth={3} />}
                </span>
                <span className="flex-1">
                  <span className="text-[15px] font-bold">{p.label}</span>
                  <span className="ml-2 text-[12px] text-fg-3">{p.note}</span>
                </span>
                <span className="text-[15px] font-bold">{won(p.price)}캐시</span>
              </button>
            </li>
          ))}
        </ul>
        <button onClick={buy} className="mt-5 h-[52px] w-full rounded-2xl bg-brand text-[16px] font-bold text-white">
          {cash >= TICKET_PRODUCTS[sel].price ? `${won(TICKET_PRODUCTS[sel].price)}캐시로 구매` : "캐시 충전하고 구매"}
        </button>
        <p className="mt-3 pb-2 text-center text-[12px] text-fg-3">시연 모드 · 실제 결제는 이루어지지 않습니다</p>
      </Sheet>
    </div>
  );
}

