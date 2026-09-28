import { PageHeader, DesktopTitle } from "@/components/common/Nav";
import { Footer } from "@/components/common/Footer";
import { WeeklyBoard } from "@/components/webtoon/WeeklyBoard";
import { rankings, webtoons } from "@/lib/data";

export const metadata = { title: "요일별 연재" };

export default function WeeklyPage() {
  const popularity = rankings.webtoon.official.map((e) => e.id);
  return (
    <main className="pt-0 md:pt-16">
      <PageHeader title="요일별 연재" />
      <div className="mx-auto max-w-[1200px] px-6">
        <DesktopTitle title="요일별 연재" desc="매일 새로운 에피소드가 업데이트됩니다 · 오늘은 월요일" />
      </div>
      <WeeklyBoard works={webtoons} popularity={popularity} />
      <Footer />
    </main>
  );
}
