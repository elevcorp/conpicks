import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common/Nav";
import { Footer } from "@/components/common/Footer";
import { TeaserCard } from "@/components/film/TeaserCards";
import { filmRanking, films } from "@/lib/data";
import type { Film } from "@/lib/types";

const COLLECTIONS: Record<string, { title: string; desc: string; pick: () => Film[] }> = {
  new: { title: "새로 올라온 티저", desc: "이번 주 1차 큐레이션을 통과한 신작", pick: () => { const s = filmRanking(1).map((r) => r.film); return Array.from(new Set([...s.filter((f) => f.rankChange === "NEW"), ...s.slice(12)])); } },
  jimovie: { title: "지무비 PICK", desc: "지무비가 직접 리뷰한 AI 영화 티저", pick: () => films.filter((f) => f.jimovieReview) },
  awards: { title: "영화제 수상작", desc: "국내외 AI 영화제에서 수상한 티저", pick: () => films.filter((f) => f.award) },
  SF: { title: "SF", desc: "미래를 먼저 본 티저", pick: () => films.filter((f) => f.genres.includes("SF")) },
  스릴러: { title: "스릴러", desc: "숨 막히는 2분", pick: () => films.filter((f) => f.genres.includes("스릴러")) },
  로맨스: { title: "로맨스", desc: "설렘을 담은 티저", pick: () => films.filter((f) => f.genres.includes("로맨스")) },
  드라마: { title: "드라마", desc: "여운이 남는 2분", pick: () => films.filter((f) => f.genres.includes("드라마")) },
  코미디: { title: "코미디", desc: "웃다가 끝나는 티저", pick: () => films.filter((f) => f.genres.includes("코미디")) },
};

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(COLLECTIONS).map((slug) => ({ slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: COLLECTIONS[decodeURIComponent((await params).slug)]?.title };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = COLLECTIONS[decodeURIComponent((await params).slug)];
  if (!c) notFound();
  const list = c.pick();
  return (
    <main className="md:pt-16">
      <PageHeader title={c.title} back="/film" />
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="pb-5 pt-4 md:pb-8 md:pt-10">
          <h1 className="hidden text-[30px] font-extrabold md:block">{c.title}</h1>
          <p className="text-[14px] text-fg-2 md:mt-1.5 md:text-[15px]">{c.desc} · {list.length}편</p>
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((f) => (
            <TeaserCard key={f.id} film={f} sizes="(max-width:640px) 100vw, 300px" />
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
