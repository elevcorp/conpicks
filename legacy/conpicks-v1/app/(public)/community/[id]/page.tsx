import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getPost } from "@/lib/data";
import { timeAgo } from "@/lib/format";
import { PostInteractions } from "./PostInteractions";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, user] = await Promise.all([getPost(id), getSessionUser()]);
  if (!data) notFound();
  const { post, author, attachedTeaser, comments } = data;

  return (
    <article className="space-y-4 pb-10">
      <Link href="/community" className="text-xs text-text-muted">
        ← 커뮤니티
      </Link>

      <div className="flex items-center gap-2 text-[11px] text-text-muted">
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-text-secondary">
          {post.category}
        </span>
        <span>{author.nickname}</span>
        <span>· {timeAgo(post.created_at)}</span>
      </div>

      <h1 className="text-xl font-extrabold">{post.title}</h1>

      <div className="text-sm whitespace-pre-line text-text-secondary">
        {post.body_md}
      </div>

      {post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {post.images.map((src) => (
            <div key={src} className="relative aspect-video overflow-hidden rounded-lg">
              <Image src={src} alt="" fill sizes="50vw" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {attachedTeaser && (
        <Link
          href={`/t/${attachedTeaser.teaser.slug}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-bg-elevated p-3"
        >
          <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={attachedTeaser.teaser.thumbnail_url}
              alt=""
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold">🎬 {attachedTeaser.teaser.title}</p>
            <p className="line-clamp-1 text-xs text-text-muted">
              {attachedTeaser.teaser.logline}
            </p>
            {attachedTeaser.stats.rank > 0 && (
              <p className="text-[11px] text-brand-accent">
                현재 {attachedTeaser.stats.rank}위
              </p>
            )}
          </div>
        </Link>
      )}

      <PostInteractions
        postId={post.id}
        initialLikes={post.like_count}
        initialComments={comments}
        loggedIn={!!user}
        currentUser={
          user ? { nickname: user.nickname, avatar_url: user.avatar_url } : null
        }
      />
    </article>
  );
}
