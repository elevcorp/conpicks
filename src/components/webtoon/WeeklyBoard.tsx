"use client";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ParamSync } from "@/components/common/ParamSync";
import { motion } from "framer-motion";
import { ArrowUpDown, Check } from "lucide-react";
import { WorkCard } from "./WorkCard";
import { Sheet } from "@/components/common/Sheet";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/cn";
import type { Webtoon } from "@/lib/types";

const DAYS = ["신작", "월", "화", "수", "목", "금", "토", "일", "완결"] as const;
const FILTERS = ["전체", "연재무료", "기다무"] as const;
const SORTS = ["전체 인기순", "업데이트순", "별점순"] as const;
const TODAY = "월"; // 2026-09-28 (Mon)

export function WeeklyBoard({ works, popularity }: { works: Webtoon[]; popularity: string[] }) {
  const router = useRouter();
  const [day, setDay] = useState<(typeof DAYS)[number]>(TODAY);
  const sync = useCallback((p: URLSearchParams) => {
    const d = p.get("day") ?? "";
    setDay((DAYS as readonly string[]).includes(d) ? (d as (typeof DAYS)[number]) : TODAY);
  }, []);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("전체 인기순");
  const [sortOpen, setSortOpen] = useState(false);

  const list = useMemo(() => {
    let l = works.filter((w) =>
      day === "신작" ? w.isNew && w.league === "official" : day === "완결" ? w.status === "completed" : w.weekdays.includes(day) && w.league === "official",
    );
    if (filter !== "전체") l = l.filter((w) => w.badges.includes(filter));
    const pop = (w: Webtoon) => {
      const i = popularity.indexOf(w.id);
      return i === -1 ? 99 : i;
    };
    if (sort === "전체 인기순") l = [...l].sort((a, b) => pop(a) - pop(b));
    if (sort === "별점순") l = [...l].sort((a, b) => b.rating - a.rating);
    if (sort === "업데이트순") l = [...l].sort((a, b) => Number(b.badges.includes("UP")) - Number(a.badges.includes("UP")));
    return l;
  }, [works, day, filter, sort, popularity]);

  return (
    <div>
      <ParamSync onChange={sync} />
      {/* day tabs */}
      <div className="sticky top-[calc(56px+env(safe-area-inset-top))] z-30 border-b border-line bg-[var(--nav)] backdrop-blur-xl md:top-16">
        <div className="mx-auto flex max-w-[1200px] justify-between px-2 py-2 md:justify-start md:gap-2 md:px-6">
          {DAYS.map((d) => {
            const active = d === day;
            return (
              <button
                key={d}
                onClick={() => { setDay(d); router.replace(`/weekly?day=${encodeURIComponent(d)}`, { scroll: false }); }}
                className={cn(
                  "relative grid h-10 min-w-10 place-items-center rounded-full px-1 text-[14px] font-bold transition-colors md:h-11 md:min-w-11",
                  active ? "text-white" : "text-fg-2 hover:text-fg",
                )}
              >
                {active && <motion.span layoutId="day-chip" className="absolute inset-0 rounded-full bg-brand" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
                <span className="relative">{d}</span>
                {d === TODAY && !active && <span className="absolute bottom-1 size-1 rounded-full bg-brand" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] md:px-6">
        <div className="flex items-center justify-between px-4 py-3 md:px-0 md:py-5">
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn("h-8 rounded-full px-3 text-[13px] font-semibold transition-colors", filter === f ? "bg-fg text-bg" : "bg-chip text-fg-2")}
              >
                {f}
              </button>
            ))}
          </div>
          <button onClick={() => setSortOpen(true)} className="flex h-8 items-center gap-1 text-[13px] font-semibold text-fg-2">
            <ArrowUpDown size={14} /> {sort}
          </button>
        </div>
        <p className="px-4 pb-3 text-[13px] text-fg-3 md:px-0">
          {day === "신작" ? "이번 달 정식 연재를 시작한 작품" : day === "완결" ? "완결까지 정주행하기 좋은 작품" : `${day}요일 연재`} · <b className="text-fg-2">{list.length}</b>작품
        </p>
        {list.length ? (
          <motion.div
            key={`${day}-${filter}-${sort}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-3 gap-x-1.5 gap-y-2 px-1.5 md:grid-cols-4 md:gap-4 md:px-0 lg:grid-cols-6"
          >
            {list.map((w, i) => (
              <WorkCard key={w.id} work={w} priority={i < 6} sizes="(max-width: 768px) 33vw, 200px" />
            ))}
          </motion.div>
        ) : (
          <EmptyState title="조건에 맞는 작품이 없어요" desc="필터를 바꿔 다른 작품을 찾아보세요" action={<button onClick={() => setFilter("전체")} className="rounded-full bg-chip px-4 py-2 text-[14px] font-semibold">필터 초기화</button>} />
        )}
      </div>

      <Sheet open={sortOpen} onClose={() => setSortOpen(false)} title="정렬">
        <ul className="pb-2">
          {SORTS.map((s) => (
            <li key={s}>
              <button onClick={() => { setSort(s); setSortOpen(false); }} className="flex h-14 w-full items-center justify-between text-[16px] font-semibold">
                <span className={cn(sort === s ? "text-brand" : "text-fg")}>{s}</span>
                {sort === s && <Check size={20} className="text-brand" />}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  );
}
