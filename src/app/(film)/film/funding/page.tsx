import { PageHeader } from "@/components/common/Nav";
import { Footer } from "@/components/common/Footer";
import { FundingPage } from "@/components/film/Funding";
import { funding, getFilm } from "@/lib/data";

export const metadata = { title: "펀딩" };

export default function FilmFundingPage() {
  const upcoming = funding.upcoming.map((u) => ({ film: getFilm(u.filmId)!, opens: u.opens, note: u.note }));
  return (
    <main className="md:pt-16">
      <PageHeader title="펀딩" />
      <div className="pt-2 md:pt-0">
        <FundingPage c={funding.campaign} film={getFilm(funding.campaign.filmId)!} upcoming={upcoming} />
      </div>
      <Footer />
    </main>
  );
}
