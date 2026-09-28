import Link from "next/link";
import { listAllPostsAdmin, listReports } from "@/lib/data";
import { timeAgo } from "@/lib/format";
import { PostModRow } from "./PostModRow";

export const metadata = { title: "커뮤니티 관리" };

export default async function AdminCommunityPage() {
  const [posts, reports] = await Promise.all([
    listAllPostsAdmin(),
    listReports(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold">커뮤니티 관리</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-bold">신고 ({reports.length})</h2>
        {reports.length === 0 ? (
          <p className="text-xs text-text-muted">처리할 신고가 없어요.</p>
        ) : (
          <ul className="space-y-1.5">
            {reports.map((r, i) => (
              <li
                key={i}
                className="rounded-lg border border-border bg-bg-elevated p-2.5 text-xs"
              >
                {String((r as { targetType?: string }).targetType)} ·{" "}
                {String((r as { reason?: string }).reason)} ·{" "}
                {timeAgo(String((r as { created_at: string }).created_at))}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold">게시글 ({posts.length})</h2>
        <ul className="space-y-2">
          {posts.map(({ post, author }) => (
            <li
              key={post.id}
              className="rounded-xl border border-border bg-bg-elevated p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/community/${post.id}`}
                  className="line-clamp-1 text-sm font-medium hover:underline"
                >
                  {post.is_pinned && "📌 "}
                  {post.is_hidden && "🚫 "}
                  {post.title}
                </Link>
                <span className="shrink-0 text-[11px] text-text-muted">
                  {author.nickname} · {post.category}
                </span>
              </div>
              <PostModRow
                id={post.id}
                hidden={post.is_hidden}
                pinned={post.is_pinned}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
