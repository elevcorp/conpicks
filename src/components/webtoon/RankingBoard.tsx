"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ParamSync } from "@/components/common/ParamSync";
import { motion } from "framer-motion";
import { Info, VolumeX, Volume2, Heart, Share2, Bookmark, MessageCircle } from "lucide-react";
import { WorkCover } from "@/components/common/Covers";
import { VideoOrCover } from "@/components/common/VideoOrCover";
import { RankDelta } from "@/components/common/RankDelta";
import { Badge, CardBadges } from "@/components/common/Badge";
import { Chips } from "@/components/common/Section";
import { Sheet } from "@/components/common/Sheet";
import { StatLine } from "./WorkCard";
import { compact } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { RankEntry, Webtoon } from "@/lib/types";

const GENRES = ["실시간", "판타지 드라마", "로맨스", "학원/판타지", "로판", "액션/무협"] as const;
type Row = RankEntry & { work: Webtoon };

export function RankingBoard({ official, league, byGenre, updatedAt }: {
  official: Row[]; league: Row[]; byGenre: Record<string, Row[]>; updatedAt: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"official" | "league">("official");
  const [genre, setGenre] = useState<(typeof GENRES)[number]>("실시간");
  const sync = useCallback((p: URLSearchParams) => {
    setTab(p.get("tab") === "league" ? "league" : "official");
    const g = p.get("genre") ?? "";
    if ((GENRES as readonly string[]).includes(g)) setGenre(g as (typeof GENRES)[number]);
  }, []);
  const [info, setInfo] = useState(false);
  const [muted, setMuted] = useState(true);

  const rows = useMemo(() => {
    const base = tab === "league" ? league : official;
    if (genre === "실시간") return base;
    const allowed = new Set(base.map((r) => r.id));
    return (byGenre[genre] ?? []).filter((r) => allowed.has(r.id)).map((r, i) => ({ ...r, rank: i + 1 }));
  }, [tab, genre, official, league, byGenre]);
  const [first, ...rest] = rows;

  return (
    <div>
      <ParamSync onChange={sync} />
      <div className="sticky top-[calc(56px+env(safe-area-inset-top))] z-30 bg-[var(--nav)] backdrop-blur-xl md:top-16">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between border-b border-line px-4 md:px-6">
          <div className="flex">
            {(["official", "league"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); router.replace(t === "league" ? "/ranking?tab=league" : "/ranking", { scroll: false }); }}
                className={cn("relative h-12 px-3 text-[16px] font-bold transition-colors", tab === t ? "text-fg" : "text-fg-3")}
              >
                {t === "official" ? "정식 연재" : "신작 리그"}
                {tab === t && <motion.span layoutId="rank-tab" className="absolute inset-x-3 bottom-0 h-[2px] bg-fg" />}
              </button>
            ))}
          </div>
          <button onClick={() => setInfo(true)} className="flex items-center gap-1 text-[12.5px] text-fg-3">
            {updatedAt} <Info size={14} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] md:px-6">
        <Chips items={GENRES} value={genre} onChange={setGenre} size="sm" className="py-3 md:py-5" />

        {first && (
          <motion.div key={`${tab}-${genre}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* #1 video-style card */}
            <Link href={`/work/${first.work.id}`} className="group relative mx-4 block overflow-hidden rounded-2xl md:mx-0">
              <VideoOrCover name={`cover_${first.work.id}`} muted={muted} className="aspect-[16/10] md:aspect-[21/8]">
                <WorkCover work={first.work} variant="wide" className="absolute inset-0" sizes="(max-width:768px) 100vw, 1200px" priority />
              </VideoOrCover>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent md:bg-gradient-to-r" />
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4 text-white md:inset-y-0 md:items-center md:p-10">
                <span className="text-[64px] font-black italic leading-none md:text-[120px]">1</span>
                <div className="min-w-0 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <CardBadges badges={first.work.badges} />
                    <RankDelta change={first.change} className="text-white" />
                  </div>
                  <p className="mt-1.5 truncate text-[22px] font-extrabold md:text-[34px]">{first.work.title}</p>
                  <p className="text-[13px] text-white/70 md:text-[15px]">{first.work.author} · {first.work.genre}</p>
                  <MetricPills stats={first.work.stats} className="mt-2.5" />
                </div>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); setMuted((m) => !m); }}
                aria-label="음소거 전환"
                className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/20 backdrop-blur"
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </Link>

            {/* mobile: kakao 3-col grid · desktop: 2-col list */}
            <div className="mt-4 grid grid-cols-3 gap-x-1.5 gap-y-5 px-1.5 md:hidden">
              {rest.map((r) => (
                <Link key={r.id} href={`/work/${r.work.id}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[6px]">
                    <WorkCover work={r.work} className="absolute inset-0" sizes="33vw" />
                    <CardBadges badges={r.work.badges} className="absolute left-1 top-1" />
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 px-0.5">
                    <span className="text-[19px] font-black italic leading-none">{r.rank}</span>
                    <RankDelta change={r.change} className="text-[11px]" />
                  </div>
                  <p className="mt-1 truncate px-0.5 text-[13px] font-bold">{r.work.title}</p>
                  <StatLine stats={r.work.stats} size="xs" className="mt-0.5 gap-1.5 px-0.5" />
                </Link>
              ))}
            </div>
            <div className="mt-6 hidden grid-cols-2 gap-x-8 gap-y-1 md:grid">
              {rest.map((r) => (
                <Link key={r.id} href={`/work/${r.work.id}`} className="group flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-chip">
                  <span className="w-10 text-center text-[28px] font-black italic">{r.rank}</span>
                  <div className="relative aspect-[3/4] w-[78px] shrink-0 overflow-hidden rounded-lg">
                    <WorkCover work={r.work} className="absolute inset-0 transition-transform duration-500 group-hover:scale-110" sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[16px] font-bold">{r.work.title}</p>
                      {r.work.badges.includes("UP") && <Badge label="UP" />}
                    </div>
                    <p className="mt-0.5 text-[13px] text-fg-3">{r.work.author} · {r.work.genre}</p>
                    <StatLine stats={r.work.stats} className="mt-2" />
                    {r.work.league === "league" && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 w-32 overflow-hidden rounded-full bg-chip"><div className="h-full bg-brand" style={{ width: `${r.work.leagueProgress}%` }} /></div>
                        <span className="text-[11px] font-bold text-brand">승격 {r.work.leagueProgress}%</span>
                      </div>
                    )}
                  </div>
                  <RankDelta change={r.change} className="w-10 text-center" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Sheet open={info} onClose={() => setInfo(false)} title="CNPX 랭킹은 이렇게 정해져요">
        <p className="text-[14px] leading-relaxed text-fg-2">조회수가 아닌 <b className="text-fg">대중의 행동 데이터</b>로 순위를 매깁니다. 매시 정각에 갱신돼요.</p>
        <ul className="mt-4 space-y-2.5">
          {[
            { icon: Share2, label: "공유", w: "×4", d: "친구에게 권할 만큼 좋았는가" },
            { icon: Bookmark, label: "저장", w: "×3", d: "다시 볼 가치가 있는가" },
            { icon: MessageCircle, label: "댓글", w: "×2", d: "이야기하고 싶게 만드는가" },
            { icon: Heart, label: "좋아요", w: "×1", d: "가벼운 호감" },
          ].map(({ icon: Icon, label, w, d }) => (
            <li key={label} className="flex items-center gap-3 rounded-xl bg-chip px-4 py-3">
              <Icon size={18} className="text-brand" />
              <span className="w-12 font-bold">{label}</span>
              <span className="w-8 font-black text-brand">{w}</span>
              <span className="text-[13px] text-fg-3">{d}</span>
            </li>
          ))}
        </ul>
        <p className="mb-2 mt-4 text-[12px] text-fg-3">신작 리그 상위권은 매주 월요일 심사를 거쳐 정식 연재로 승격됩니다.</p>
      </Sheet>
    </div>
  );
}

function MetricPills({ stats, className }: { stats: Webtoon["stats"]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-1.5 text-[12px] font-semibold md:text-[13px]", className)}>
      <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur"><Heart size={12} className="fill-white" />{compact(stats.likes)}</span>
      <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur"><Share2 size={12} />공유 {compact(stats.shares)}</span>
      <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur"><Bookmark size={12} />저장 {compact(stats.saves)}</span>
    </div>
  );
}
