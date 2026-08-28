import { Clapperboard } from "lucide-react";
import Link from "next/link";
import { getHomeBundle } from "@/lib/data";
import { HeroBanner } from "@/components/teaser/HeroBanner";
import { TeaserRow } from "@/components/teaser/TeaserRow";
import { FundingCard } from "@/components/funding/FundingCard";

export const revalidate = 60;

export default async function HomePage() {
  const home = await getHomeBundle();

  return (
    <div className="space-y-8">
      <HeroBanner items={home.hero} />

      {/* Shorts-mode entry */}
      <Link
        href="/feed"
        className="bg-brand-gradient flex items-center gap-3 rounded-xl p-4 text-white"
      >
        <Clapperboard className="h-6 w-6" />
        <div className="flex-1">
          <p className="text-sm font-bold">바로 넘겨보기</p>
          <p className="text-xs text-white/80">
            세로 스와이프로 티저를 빠르게 훑어보세요
          </p>
        </div>
        <span className="text-sm font-bold">→</span>
      </Link>

      <TeaserRow
        title="실시간 랭킹 Top 10"
        items={home.rankingTop10}
        href="/discover?sort=rank"
        variant="ranking"
      />
      <TeaserRow title="새로 올라온 작품" items={home.fresh} href="/discover?sort=new" />
      <TeaserRow
        title="가장 많이 공유된 작품"
        items={home.mostShared}
        href="/discover?sort=share"
      />
      {home.jimovieReviews.length > 0 && (
        <TeaserRow title="지무비 리뷰 작품" items={home.jimovieReviews} />
      )}

      {home.funding.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-base font-bold">펀딩 진행 중</h2>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {home.funding.map((f) => (
              <FundingCard
                key={f.campaign.id}
                campaign={f.campaign}
                teaser={f.teaser}
              />
            ))}
          </div>
        </section>
      )}

      {home.byGenre.map((row) => (
        <TeaserRow
          key={row.genre}
          title={row.genre}
          items={row.items}
          href={`/discover/${encodeURIComponent(row.genre)}`}
        />
      ))}
    </div>
  );
}
