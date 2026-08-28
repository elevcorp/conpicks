import Link from "next/link";
import { PencilLine } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { listPosts } from "@/lib/data";
import { PostCard } from "@/components/community/PostCard";
import { EmptyState } from "@/components/common/EmptyState";

export const metadata = { title: "커뮤니티" };

const CATEGORIES = [
  "전체",
  "작품 토론",
  "AI 제작 팁",
  "크리에이터 라운지",
  "공지",
] as const;

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: "hot" | "new" }>;
}) {
  const { category = "전체", sort = "hot" } = await searchParams;
  const [user, { items }] = await Promise.all([
    getSessionUser(),
    listPosts({ category: category as never, sort, limit: 30 }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">커뮤니티</h1>
        {user && (
          <Link
            href="/community/write"
            className="bg-brand-gradient flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
          >
            <PencilLine className="h-3.5 w-3.5" /> 글쓰기
          </Link>
        )}
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/community?category=${encodeURIComponent(c)}&sort=${sort}`}
            className={`rounded-full border px-3 py-1.5 text-xs whitespace-nowrap ${
              category === c
                ? "border-brand-gradient text-text-primary"
                : "border-border text-text-secondary"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="flex gap-1 text-xs">
        {(["hot", "new"] as const).map((s) => (
          <Link
            key={s}
            href={`/community?category=${encodeURIComponent(category)}&sort=${s}`}
            className={`rounded-full px-2.5 py-1 ${
              sort === s ? "bg-white/10 text-text-primary" : "text-text-muted"
            }`}
          >
            {s === "hot" ? "인기 (24h)" : "최신"}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="아직 글이 없어요"
          description="마음에 든 티저를 공유하며 첫 글을 남겨보세요."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((vm) => (
            <li key={vm.post.id}>
              <PostCard vm={vm} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
