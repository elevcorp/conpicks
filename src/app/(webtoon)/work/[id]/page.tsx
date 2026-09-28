import { notFound } from "next/navigation";
import { WorkDetail } from "@/components/webtoon/WorkDetail";
import { getComments, getFilm, getWebtoon, rankOf, webtoons } from "@/lib/data";
import { getEpisode, getEpisodeSummaries } from "@/lib/episodes";

export const dynamicParams = false;
export const generateStaticParams = () => webtoons.map((w) => ({ id: w.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const w = getWebtoon((await params).id);
  return { title: w?.title, description: w?.tagline };
}

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = getWebtoon(id);
  if (!work) notFound();

  const sameCreator = webtoons.filter((w) => w.id !== id && (w.writer === work.writer || w.artist === work.artist || w.publisher === work.publisher));
  const similar = webtoons.filter((w) => w.id !== id && w.genreKey === work.genreKey && !sameCreator.includes(w));
  const others = [...sameCreator, ...similar].slice(0, 8);
  const filler = others.length < 4 ? webtoons.filter((w) => w.id !== id && !others.includes(w) && w.rankGenre === work.rankGenre).slice(0, 6 - others.length) : [];

  return (
    <WorkDetail
      work={work}
      episodes={getEpisodeSummaries(id)}
      first={getEpisode(id, 1)!}
      comments={getComments(id)}
      others={[...others, ...filler]}
      othersLabel={sameCreator.length ? "작가의 다른 작품" : "이 작품과 비슷한 작품"}
      rank={rankOf(id)}
      film={work.filmId ? getFilm(work.filmId) : undefined}
    />
  );
}
