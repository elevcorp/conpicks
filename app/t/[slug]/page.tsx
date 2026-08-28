import type { Metadata } from "next";
import { getTeaserBySlug } from "@/lib/data";
import { TeaserDetail } from "@/components/teaser/TeaserDetail";
import { SheetChrome } from "./SheetChrome";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = await getTeaserBySlug(slug);
  if (!d) return { title: "작품을 찾을 수 없음" };
  return {
    title: d.teaser.title,
    description: d.teaser.logline,
    openGraph: {
      title: d.teaser.title,
      description: d.teaser.logline,
      images: [d.teaser.poster_url],
    },
  };
}

export default async function TeaserPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="min-h-dvh bg-bg-base">
      <div className="mx-auto max-w-2xl">
        <SheetChrome>
          <div className="px-4 pb-16">
            <TeaserDetail slug={slug} />
          </div>
        </SheetChrome>
      </div>
    </div>
  );
}
