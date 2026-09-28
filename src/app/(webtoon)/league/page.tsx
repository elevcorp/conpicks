import { PageHeader } from "@/components/common/Nav";
import { Footer } from "@/components/common/Footer";
import { LeagueBoard } from "@/components/webtoon/LeagueBoard";
import { webtoons } from "@/lib/data";

export const metadata = { title: "신작 리그" };

export default function LeaguePage() {
  return (
    <main className="md:pt-16">
      <PageHeader title="신작 리그" />
      <div className="pt-2 md:pt-0">
        <LeagueBoard works={webtoons.filter((w) => w.league === "league")} />
      </div>
      <Footer />
    </main>
  );
}
