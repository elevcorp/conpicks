import { PageHeader } from "@/components/common/Nav";
import { Footer } from "@/components/common/Footer";
import { FilmRanking } from "@/components/film/FilmRanking";
import { filmRanking } from "@/lib/data";

export const metadata = { title: "티저 랭킹" };

export default function FilmRankingPage() {
  return (
    <main className="md:pt-16">
      <PageHeader title="랭킹" />
      <div className="pt-2 md:pt-0">
        <FilmRanking s1={filmRanking(1)} s0={filmRanking(0)} />
      </div>
      <Footer />
    </main>
  );
}
