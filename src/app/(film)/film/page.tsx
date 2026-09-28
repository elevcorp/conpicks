import { HomeTopBar } from "@/components/common/Nav";
import { Container, SectionHeader } from "@/components/common/Section";
import { Footer } from "@/components/common/Footer";
import { HeroBillboard } from "@/components/film/HeroBillboard";
import { BrandTiles } from "@/components/film/BrandTiles";
import { TeaserRow, Top10Row } from "@/components/film/FilmRows";
import { FundingCard } from "@/components/film/Funding";
import { filmRanking, films, funding, getFilm } from "@/lib/data";

export const metadata = { title: "AI 영화" };

const GENRE_ROWS = [
  { g: "스릴러", title: "숨 막히는 스릴러" },
  { g: "드라마", title: "드라마 · 여운이 남는 2분" },
  { g: "코미디", title: "코미디" },
  { g: "SF", title: "SF · 미래를 먼저 본 티저" },
];

export default function FilmHome() {
  const season = filmRanking(1).map((r) => r.film);
  const top3 = season.slice(0, 3);
  const fresh = Array.from(new Set([...season.filter((f) => f.rankChange === "NEW"), ...season.slice(12)]));
  const fundFilm = getFilm(funding.campaign.filmId)!;

  return (
    <main>
      <HomeTopBar world="film" />
      <HeroBillboard films={top3} />
      <Container className="relative -mt-2 space-y-11 md:mt-4 md:space-y-16">
        <BrandTiles />
        <section>
          <SectionHeader title="실시간 랭킹 Top 10" sub="시즌 1 · 좋아요·공유·저장·댓글로 검증" href="/film/ranking" />
          <Top10Row films={season.slice(0, 10)} />
        </section>
        <section>
          <SectionHeader title="새로 올라온 티저" sub="이번 주 1차 큐레이션 통과" href="/film/collection/new" />
          <TeaserRow films={fresh} />
        </section>
        <section>
          <SectionHeader title="펀딩 진행 중" sub="우승작은 대중과 함께 만듭니다" href="/film/funding" />
          <div className="px-4 md:px-0">
            <FundingCard c={funding.campaign} film={fundFilm} />
          </div>
        </section>
        {GENRE_ROWS.map(({ g, title }) => (
          <section key={g}>
            <SectionHeader title={title} href={`/film/collection/${encodeURIComponent(g)}`} />
            <TeaserRow films={films.filter((f) => f.genres.includes(g))} />
          </section>
        ))}
      </Container>
      <Footer />
    </main>
  );
}
