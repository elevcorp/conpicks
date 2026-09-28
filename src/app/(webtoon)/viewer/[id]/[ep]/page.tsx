import { notFound } from "next/navigation";
import { Viewer } from "@/components/webtoon/Viewer";
import { getComments, getWebtoon, webtoons } from "@/lib/data";
import { getEpisode, getEpisodes, summarize } from "@/lib/episodes";

// Pre-render the episodes a demo is likely to open (opening + latest arc);
// the rest render on first request and are cached.
export const dynamicParams = true;
export function generateStaticParams() {
  return webtoons.flatMap((w) => {
    const eps = new Set([1, 2, 3, ...Array.from({ length: 6 }, (_, i) => w.episodeCount - i)]);
    return [...eps].filter((e) => e >= 1 && e <= w.episodeCount).map((e) => ({ id: w.id, ep: String(e) }));
  });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; ep: string }> }) {
  const { id, ep } = await params;
  const w = getWebtoon(id);
  return { title: w ? `${w.title} ${ep}화` : "뷰어" };
}

export default async function ViewerPage({ params }: { params: Promise<{ id: string; ep: string }> }) {
  const { id, ep: epStr } = await params;
  const work = getWebtoon(id);
  const ep = Number(epStr);
  const episode = work && Number.isInteger(ep) ? getEpisode(id, ep) : undefined;
  if (!work || !episode) notFound();
  const all = getEpisodes(id);
  const prev = all[ep - 2];
  const next = all[ep];
  return (
    <Viewer
      work={work}
      episode={episode}
      prev={prev ? summarize(prev) : undefined}
      next={next ? summarize(next) : undefined}
      total={all.length}
      comments={getComments(id)}
    />
  );
}
