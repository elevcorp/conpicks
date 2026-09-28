import { PageHeader, DesktopTitle } from "@/components/common/Nav";
import { Footer } from "@/components/common/Footer";
import { RankingBoard } from "@/components/webtoon/RankingBoard";
import { getWebtoon, leagueRanking, officialRanking, rankings } from "@/lib/data";

export const metadata = { title: "실시간 랭킹" };

export default function RankingPage() {
  const byGenre = Object.fromEntries(
    Object.entries(rankings.webtoon.byGenre).map(([g, list]) => [g, list.map((e) => ({ ...e, work: getWebtoon(e.id)! }))]),
  );
  return (
    <main className="md:pt-16">
      <PageHeader title="랭킹" />
      <div className="mx-auto max-w-[1200px] px-6">
        <DesktopTitle title="실시간 랭킹" desc="좋아요 · 공유 · 저장 · 댓글, 대중의 행동 데이터로 검증한 순위" />
      </div>
      <RankingBoard official={officialRanking()} league={leagueRanking()} byGenre={byGenre} updatedAt={rankings.updatedAt} />
      <Footer />
    </main>
  );
}
