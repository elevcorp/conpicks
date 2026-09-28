"use client";
import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Trophy, Rocket, CheckCircle2, Clapperboard } from "lucide-react";
import { Row, SectionHeader, Chips } from "@/components/common/Section";
import { WorkCard, RankRow, NewWorkCard } from "./WorkCard";
import { cn } from "@/lib/cn";
import type { RankChange, Webtoon } from "@/lib/types";

export const cardW = "w-[38vw] max-w-[176px] md:w-[calc((100%-48px)/4)] md:max-w-none lg:w-[calc((100%-80px)/6)]";

export function HomeSubTabs() {
  // Rendered only on the home route, so "홈" is the active item.
  const items = [
    { href: "/", label: "홈", active: true },
    { href: "/weekly", label: "요일별", active: false },
    { href: "/weekly?day=신작", label: "신작", active: false },
    { href: "/weekly?day=완결", label: "완결", active: false },
    { href: "/league", label: "신작리그", active: false },
  ];
  return (
    <nav className="flex h-10 items-center gap-5 px-4 text-[15px] font-bold">
      {items.map((t) => (
        <Link key={t.label} href={t.href} className={cn("relative transition-colors", t.active ? "text-white" : "text-white/55")}>
          {t.label}
          {t.active && <span className="absolute -bottom-[9px] left-0 right-0 mx-auto h-[2px] w-4 rounded-full bg-white" />}
        </Link>
      ))}
    </nav>
  );
}

export function QuickMenu() {
  const items = [
    { href: "/weekly", label: "요일별", icon: CalendarDays },
    { href: "/ranking", label: "실시간랭킹", icon: Trophy },
    { href: "/league", label: "신작리그", icon: Rocket },
    { href: "/weekly?day=완결", label: "완결작", icon: CheckCircle2 },
    { href: "/film", label: "AI 영화", icon: Clapperboard },
  ];
  return (
    <div className="grid grid-cols-5 gap-1 px-3 md:hidden">
      {items.map(({ href, label, icon: Icon }) => (
        <Link key={label} href={href} className="flex flex-col items-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold text-fg-2 active:bg-chip">
          <span className="grid size-11 place-items-center rounded-2xl bg-elev text-fg">
            <Icon size={21} />
          </span>
          {label}
        </Link>
      ))}
    </div>
  );
}

export function CardRow({ works, reviewBadge, hrefSuffix }: { works: Webtoon[]; reviewBadge?: boolean; hrefSuffix?: string }) {
  return (
    <Row>
      {works.map((w) => (
        <WorkCard key={w.id} work={w} className={cardW} reviewBadge={reviewBadge} href={hrefSuffix ? `/work/${w.id}${hrefSuffix}` : undefined} />
      ))}
    </Row>
  );
}

export function NewWorksRow({ works }: { works: Webtoon[] }) {
  return (
    <Row>
      {works.map((w) => (
        <NewWorkCard key={w.id} work={w} />
      ))}
    </Row>
  );
}

export function RankingPreview({ rows, updatedAt }: { rows: { work: Webtoon; rank: number; change: RankChange }[]; updatedAt: string }) {
  return (
    <section>
      <SectionHeader title="실시간 랭킹 TOP 10" sub={`${updatedAt} 기준`} href="/ranking" />
      <div className="grid md:grid-cols-2 md:gap-x-8">
        {rows.map((r, idx) => (
          <div key={r.work.id} className={cn(idx >= 5 && "hidden md:block")}>
            <RankRow work={r.work} rank={r.rank} change={r.change} />
          </div>
        ))}
      </div>
      <Link href="/ranking" className="mx-4 mt-2 flex h-11 items-center justify-center rounded-xl border border-line text-[14px] font-semibold text-fg-2 md:hidden">
        실시간 랭킹 전체보기
      </Link>
    </section>
  );
}

export function AgeGenderRanking({ groups }: { groups: Record<string, Webtoon[]> }) {
  const keys = Object.keys(groups);
  const [k, setK] = useState(keys[3] ?? keys[0]);
  return (
    <section>
      <SectionHeader title="연령별 · 성별 실시간 랭킹" sub="나와 비슷한 독자들이 지금 보는 작품" />
      <Chips items={keys} value={k} onChange={setK} size="sm" className="mb-2" />
      <div className="grid md:grid-cols-2 md:gap-x-8">
        {groups[k].map((w, i) => (
          <RankRow key={`${k}-${w.id}`} work={w} rank={i + 1} change={i === 0 ? 0 : ((i * 3) % 5) - 2 || "NEW"} />
        ))}
      </div>
    </section>
  );
}
