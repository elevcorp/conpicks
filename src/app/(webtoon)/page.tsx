import { HomeTopBar } from "@/components/common/Nav";
import { Container, SectionHeader } from "@/components/common/Section";
import { Footer } from "@/components/common/Footer";
import { HeroCarousel } from "@/components/webtoon/HeroCarousel";
import { AgeGenderRanking, CardRow, HomeSubTabs, NewWorksRow, QuickMenu, RankingPreview } from "@/components/webtoon/HomeSections";
import { getWebtoon, officialRanking, rankings, webtoons } from "@/lib/data";

export default function WebtoonHome() {
  const ranking = officialRanking();
  const top3 = ranking.slice(0, 3).map((r) => r.work);
  const newWorks = webtoons.filter((w) => w.isNew);
  const jimovie = webtoons.filter((w) => w.jimovieReview);
  const jimovieTotal = jimovie.reduce((a, w) => a + parseFloat(w.jimovieReview!.views), 0).toLocaleString("ko-KR");
  const byGenre = (keys: string[]) => ranking.map((r) => r.work).filter((w) => keys.includes(w.genreKey));
  const ageGroups = Object.fromEntries(Object.entries(rankings.ageGender).map(([k, ids]) => [k, ids.map((id) => getWebtoon(id)!)]));

  return (
    <main>
      <HomeTopBar world="webtoon">
        <HomeSubTabs />
      </HomeTopBar>
      <HeroCarousel works={top3} />
      <Container className="relative mt-4 space-y-10 md:mt-10 md:space-y-14">
        <QuickMenu />
        <RankingPreview rows={ranking.slice(0, 10)} updatedAt={rankings.updatedAt} />
        <section>
          <SectionHeader title="이달의 신작" sub="1차 큐레이션을 통과한 9월의 새 얼굴" href="/weekly?day=신작" />
          <NewWorksRow works={newWorks} />
        </section>
        <section>
          <SectionHeader title={<>지무비 <span className="text-brand">PICK</span></>} sub={`지무비가 직접 리뷰한 작품 · 누적 리뷰 조회수 ${jimovieTotal}만`} />
          <CardRow works={jimovie} reviewBadge hrefSuffix="?tab=info#review" />
        </section>
        <section>
          <SectionHeader title="설렘 가득 로판" href="/ranking?genre=로판" />
          <CardRow works={byGenre(["rofan"])} />
        </section>
        <section>
          <SectionHeader title="판타지 · 무협" href="/ranking?genre=액션/무협" />
          <CardRow works={byGenre(["murim", "fantasy", "action", "thriller"])} />
        </section>
        <section>
          <SectionHeader title="두근두근 로맨스" href="/ranking?genre=로맨스" />
          <CardRow works={[...byGenre(["romance", "sfromance", "school", "healing"]), ...webtoons.filter((w) => w.league === "league" && w.genreKey === "romance")]} />
        </section>
        <AgeGenderRanking groups={ageGroups} />
      </Container>
      <Footer />
    </main>
  );
}
