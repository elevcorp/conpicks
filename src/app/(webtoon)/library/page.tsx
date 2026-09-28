import { PageHeader, DesktopTitle } from "@/components/common/Nav";
import { Footer } from "@/components/common/Footer";
import { Library } from "@/components/webtoon/Library";

export const metadata = { title: "보관함" };

export default function LibraryPage() {
  return (
    <main className="md:pt-16">
      <PageHeader title="보관함" />
      <div className="mx-auto max-w-[1200px] px-6">
        <DesktopTitle title="보관함" desc="최근 감상 · 찜한 작품 · 구매 작품" />
      </div>
      <Library />
      <Footer />
    </main>
  );
}
