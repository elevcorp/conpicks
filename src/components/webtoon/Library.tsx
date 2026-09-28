"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { LibraryBig, Heart, Clock, ShoppingBag } from "lucide-react";
import { WorkCover } from "@/components/common/Covers";
import { WorkCard } from "./WorkCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ParamSync } from "@/components/common/ParamSync";
import { useUser } from "@/store/user";
import { useUI } from "@/store/ui";
import { webtoons } from "@/lib/catalog";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "recent", label: "최근 감상", icon: Clock },
  { key: "liked", label: "찜한 작품", icon: Heart },
  { key: "bought", label: "구매 작품", icon: ShoppingBag },
] as const;
type Key = (typeof TABS)[number]["key"];
const byId = new Map(webtoons.map((w) => [w.id, w]));
const grid = "grid grid-cols-3 gap-x-1.5 gap-y-4 px-1.5 md:grid-cols-4 md:gap-4 md:px-0 lg:grid-cols-6";

export function Library() {
  const [tab, setTab] = useState<Key>("recent");
  const sync = useCallback((p: URLSearchParams) => {
    const t = TABS.find((x) => x.key === p.get("tab"));
    if (t) setTab(t.key);
  }, []);
  const { loggedIn, login, recent, liked, saved, purchased } = useUser();
  const toast = useUI((s) => s.toast);

  const likedWorks = Array.from(new Set([...liked, ...saved])).map((id) => byId.get(id)!).filter(Boolean);
  const bought = Object.entries(
    purchased.reduce<Record<string, number>>((acc, k) => {
      const id = k.split(":")[0];
      acc[id] = (acc[id] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([id, n]) => ({ work: byId.get(id)!, n }));

  return (
    <div className="mx-auto max-w-[1200px] md:px-6">
      <ParamSync onChange={sync} />
      <div className="sticky top-[calc(56px+env(safe-area-inset-top))] z-30 flex border-b border-line bg-[var(--nav)] px-2 backdrop-blur-xl md:top-16 md:px-0">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn("relative h-12 px-3 text-[15px] font-bold", tab === t.key ? "text-fg" : "text-fg-3")}>
            {t.label}
            {tab === t.key && <motion.span layoutId="lib-tab" className="absolute inset-x-3 bottom-0 h-[2px] bg-fg" />}
          </button>
        ))}
      </div>

      {!loggedIn ? (
        <EmptyState
          icon={<LibraryBig size={28} />}
          title="로그인하고 보관함을 이용해 보세요"
          desc={"최근 본 작품, 찜한 작품, 구매한 회차를\n어느 기기에서든 이어볼 수 있어요"}
          action={
            <button onClick={() => { login(); toast("시연계정으로 로그인했어요", "success"); }} className="h-12 rounded-full bg-brand px-8 text-[15px] font-bold text-white">
              로그인
            </button>
          }
          className="py-28"
        />
      ) : (
        <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
          {tab === "recent" &&
            (recent.length ? (
              <div className={grid}>
                {recent.map(({ id, ep }) => {
                  const w = byId.get(id);
                  if (!w) return null;
                  return (
                    <Link key={id} href={`/viewer/${id}/${ep}`} className="group block">
                      <div className="relative aspect-[3/5] overflow-hidden rounded-md">
                        <WorkCover work={w} className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" sizes="200px" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 pb-2 pt-8">
                          <p className="text-[12px] font-bold text-white">{ep}화 보는 중</p>
                          <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/25">
                            <div className="h-full bg-brand" style={{ width: `${Math.min(100, (ep / w.episodeCount) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                      <p className="mt-1.5 truncate text-[13px] font-semibold">{w.title}</p>
                      <p className="text-[11.5px] text-fg-3">{ep}/{w.episodeCount}화</p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={<Clock size={26} />} title="최근 감상한 작품이 없어요" desc="첫 화부터 가볍게 시작해 보세요" action={<Link href="/" className="rounded-full bg-chip px-5 py-2.5 text-[14px] font-semibold">작품 둘러보기</Link>} />
            ))}
          {tab === "liked" &&
            (likedWorks.length ? (
              <div className={grid}>
                {likedWorks.map((w) => <WorkCard key={w.id} work={w} sizes="200px" />)}
              </div>
            ) : (
              <EmptyState icon={<Heart size={26} />} title="찜한 작품이 없어요" desc="작품홈의 ♡를 눌러 찜해 보세요" />
            ))}
          {tab === "bought" &&
            (bought.length ? (
              <div className={grid}>
                {bought.map(({ work, n }) => (
                  <Link key={work.id} href={`/work/${work.id}?tab=episodes`} className="group block">
                    <div className="relative aspect-[3/5] overflow-hidden rounded-md">
                      <WorkCover work={work} className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" sizes="200px" />
                      <span className="absolute left-1.5 top-1.5 rounded bg-brand px-1.5 py-0.5 text-[10.5px] font-bold text-white">대여 {n}화</span>
                    </div>
                    <p className="mt-1.5 truncate text-[13px] font-semibold">{work.title}</p>
                    <p className="text-[11.5px] text-fg-3">미리보기 {n}개 회차</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={<ShoppingBag size={26} />} title="구매한 작품이 없어요" desc="미리보기로 다음 화를 먼저 만나보세요" />
            ))}
        </motion.div>
      )}
    </div>
  );
}
