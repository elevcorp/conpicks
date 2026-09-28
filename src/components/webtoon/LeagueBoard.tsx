"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, Upload, Rocket, Users, ShieldCheck, Trophy, Bell } from "lucide-react";
import { WorkCover } from "@/components/common/Covers";
import { Badge } from "@/components/common/Badge";
import { Chips, Row } from "@/components/common/Section";
import { Sheet } from "@/components/common/Sheet";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/cn";
import type { Webtoon } from "@/lib/types";

const SORTS = ["조회순", "업데이트순", "별점순"] as const;
const UPDATED: Record<string, string> = { wt_25: "12분 전", wt_26: "어제", wt_27: "1시간 전", wt_28: "3시간 전", wt_29: "38분 전", wt_30: "2시간 전", wt_31: "2일 전" };
const viewsNum = (v: string) => parseFloat(v) * (v.includes("만") ? 10000 : 1);

export function LeagueBoard({ works }: { works: Webtoon[] }) {
  const [sort, setSort] = useState<(typeof SORTS)[number]>("조회순");
  const genres = useMemo(() => ["전체", ...Array.from(new Set(works.map((w) => w.genre)))], [works]);
  const [genre, setGenre] = useState("전체");
  const [upload, setUpload] = useState(false);
  const toast = useUI((s) => s.toast);

  const top3 = [...works].sort((a, b) => b.leagueProgress - a.leagueProgress).slice(0, 3);
  const list = useMemo(() => {
    let l = genre === "전체" ? works : works.filter((w) => w.genre === genre);
    if (sort === "조회순") l = [...l].sort((a, b) => viewsNum(b.views) - viewsNum(a.views));
    if (sort === "별점순") l = [...l].sort((a, b) => b.rating - a.rating);
    if (sort === "업데이트순") l = [...l].sort((a, b) => Number(b.badges.includes("UP")) - Number(a.badges.includes("UP")));
    return l;
  }, [works, sort, genre]);

  return (
    <div className="mx-auto max-w-[1200px] md:px-6">
      <div className="hidden items-end justify-between pb-6 pt-10 md:flex">
        <div>
          <h1 className="text-[30px] font-extrabold tracking-tight">신작 리그</h1>
          <p className="mt-1.5 text-[15px] text-fg-2">1차 큐레이션을 통과한 신작들의 정식 연재 승격전</p>
        </div>
        <UploadButton onClick={() => setUpload(true)} />
      </div>

      {/* explainer banner */}
      <div className="relative mx-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b4fd8] via-[#3182F6] to-[#6aa7ff] p-5 text-white md:mx-0 md:p-8">
        <div className="absolute -right-6 -top-6 text-[120px] opacity-15 md:text-[180px]">🏆</div>
        <p className="text-[12px] font-bold tracking-wide text-white/80">CNPX LEAGUE · SEASON 1 · 4주차</p>
        <p className="mt-1.5 text-[19px] font-extrabold leading-snug md:text-[26px]">
          매주 대중의 선택으로
          <br className="md:hidden" /> 정식 연재가 결정됩니다
        </p>
        <p className="mt-1.5 text-[13px] text-white/80 md:text-[15px]">1차 큐레이션(지무비 · MCN 심사) 통과작 리그 · 매주 월요일 승격 발표</p>
        <div className="mt-4 flex gap-2 text-[12px] font-semibold md:text-[13px]">
          {[{ i: ShieldCheck, t: "1차 큐레이션" }, { i: Users, t: "2차 대중 검증" }, { i: Trophy, t: "정식 연재" }].map(({ i: I, t }, k) => (
            <span key={t} className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1.5 backdrop-blur">
              <I size={13} /> {t}
              {k < 2 && <span className="ml-1 opacity-60">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* today's hot */}
      <section className="mt-8">
        <h2 className="mb-3 px-4 text-[19px] font-extrabold md:px-0 md:text-[22px]">오늘의 인기 리그작</h2>
        <Row>
          {top3.map((w, i) => (
            <Link key={w.id} href={`/work/${w.id}`} className="group relative block w-[78vw] max-w-[340px] overflow-hidden rounded-2xl md:w-[calc((100%-32px)/3)] md:max-w-none">
              <div className="relative aspect-[4/3]">
                <WorkCover work={w} variant="wide" className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" sizes="360px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <span className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-brand text-[16px] font-black text-white">{i + 1}</span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-[18px] font-extrabold">{w.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-[13px] text-white/75">{w.tagline}</p>
                  <Progress value={w.leagueProgress} onDark className="mt-3" />
                </div>
              </div>
            </Link>
          ))}
        </Row>
      </section>

      {/* sort + genre */}
      <div className="mt-8 flex items-center justify-between border-b border-line px-4 md:px-0">
        <div className="flex">
          {SORTS.map((s) => (
            <button key={s} onClick={() => setSort(s)} className={cn("relative h-11 px-3 text-[15px] font-bold", sort === s ? "text-fg" : "text-fg-3")}>
              {s}
              {sort === s && <motion.span layoutId="league-sort" className="absolute inset-x-3 bottom-0 h-[2px] bg-fg" />}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-fg-3">{list.length}작품</span>
      </div>
      <Chips items={genres} value={genre} onChange={setGenre} size="sm" className="py-3" />

      <ul className="grid md:grid-cols-2 md:gap-x-6">
        {list.map((w) => (
          <li key={w.id}>
            <Link href={`/work/${w.id}`} className="group flex gap-3.5 border-b border-line px-4 py-4 transition-colors hover:bg-chip md:rounded-xl md:border-none md:px-3">
              <div className="relative aspect-[3/5] w-[88px] shrink-0 overflow-hidden rounded-lg">
                <WorkCover work={w} className="absolute inset-0 transition-transform duration-500 group-hover:scale-110" sizes="90px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[16px] font-bold">{w.title}</p>
                  {w.badges.includes("UP") && <Badge label="UP" />}
                </div>
                <p className="mt-0.5 text-[12.5px] text-fg-3">{w.author} · {w.genre}</p>
                <p className="mt-1 line-clamp-1 text-[13px] text-fg-2">{w.tagline}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[12px] text-fg-3">
                  <span className="flex items-center gap-0.5 font-bold text-fg"><Star size={12} className="fill-free text-free" />{w.rating.toFixed(2)}</span>
                  <span>조회 {w.views}</span>
                  <span>{UPDATED[w.id] ?? "오늘"} 업데이트</span>
                </div>
                <Progress value={w.leagueProgress} className="mt-2.5" />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] right-4 z-40 md:hidden">
        <UploadButton onClick={() => setUpload(true)} floating />
      </div>

      <Sheet open={upload} onClose={() => setUpload(false)} title="내 작품 올리기">
        <div className="flex flex-col items-center pb-2 pt-2 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-brand-soft text-brand">
            <Rocket size={30} />
          </div>
          <p className="mt-4 text-[17px] font-bold">창작자 업로드는 정식 오픈 시 제공됩니다</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-fg-2">AI로 만든 웹툰을 올리면 1차 큐레이션 후
            <br />신작 리그에서 독자들의 선택을 받게 돼요.</p>
          <ol className="mt-5 w-full space-y-2 text-left">
            {["작품 등록 · 1~3화 업로드", "1차 큐레이션 (지무비 · MCN 심사, 약 5일)", "신작 리그 진출 · 대중 검증", "승격 게이지 100% → 정식 연재 계약"].map((s, i) => (
              <li key={s} className="flex items-center gap-3 rounded-xl bg-chip px-4 py-3 text-[14px]">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-[12px] font-bold text-white">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <button
            onClick={() => { setUpload(false); toast("오픈 알림을 신청했어요 · 12월에 가장 먼저 알려드릴게요", "success"); }}
            className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-brand text-[16px] font-bold text-white"
          >
            <Bell size={18} /> 창작자 오픈 알림 받기
          </button>
        </div>
      </Sheet>
    </div>
  );
}

function UploadButton({ onClick, floating }: { onClick: () => void; floating?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full bg-brand font-bold text-white transition hover:brightness-110",
        floating ? "h-12 px-5 text-[14px] shadow-[0_8px_24px_rgba(49,130,246,0.45)]" : "h-11 px-5 text-[14px]",
      )}
    >
      <Upload size={17} /> 내 작품 올리기
    </button>
  );
}

export function Progress({ value, className, onDark }: { value: number; className?: string; onDark?: boolean }) {
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between text-[11.5px] font-semibold">
        <span className={onDark ? "text-white/80" : "text-fg-2"}>정식 연재까지</span>
        <span className="font-extrabold text-brand">{value}%</span>
      </div>
      <div className={cn("h-1.5 overflow-hidden rounded-full", onDark ? "bg-white/20" : "bg-chip")}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#1b64da] to-brand"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
