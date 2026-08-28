import { Heart, MessageSquare, Pin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/format";
import type { Post, TeaserCardVM } from "@/lib/types";

export interface PostVM {
  post: Post;
  author: { nickname: string; avatar_url: string | null; role: string };
  attachedTeaser: TeaserCardVM | null;
}

export function PostCard({ vm }: { vm: PostVM }) {
  const { post, author, attachedTeaser } = vm;
  return (
    <Link
      href={`/community/${post.id}`}
      className="block rounded-xl border border-border bg-bg-elevated p-4 transition-colors hover:bg-white/5"
    >
      <div className="flex items-center gap-2 text-[11px] text-text-muted">
        {post.is_pinned && <Pin className="h-3 w-3 text-brand-accent" />}
        <span className="rounded bg-white/10 px-1.5 py-0.5 font-medium text-text-secondary">
          {post.category}
        </span>
        <span>{author.nickname}</span>
        {(author.role === "creator" || author.role === "admin") && (
          <span className="rounded bg-brand-accent/15 px-1 text-[9px] font-bold text-brand-accent">
            Creator
          </span>
        )}
        <span>· {timeAgo(post.created_at)}</span>
      </div>

      <h3 className="mt-1.5 line-clamp-2 text-sm font-bold">{post.title}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-text-muted">
        {post.body_md.replace(/[#*`>\-]/g, "")}
      </p>

      {attachedTeaser && (
        <div className="mt-2.5 flex items-center gap-2.5 rounded-lg border border-border bg-black/20 p-2">
          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded">
            <Image
              src={attachedTeaser.teaser.thumbnail_url}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-1 text-xs font-semibold">
              🎬 {attachedTeaser.teaser.title}
            </p>
            <p className="line-clamp-1 text-[11px] text-text-muted">
              {attachedTeaser.teaser.genres.join(" · ")}
              {attachedTeaser.stats.rank > 0 &&
                ` · 현재 ${attachedTeaser.stats.rank}위`}
            </p>
          </div>
        </div>
      )}

      {post.images.length > 0 && (
        <div className="mt-2 flex gap-1.5">
          {post.images.slice(0, 4).map((src) => (
            <div
              key={src}
              className="relative h-16 w-16 overflow-hidden rounded"
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-2.5 flex items-center gap-4 text-[11px] text-text-muted">
        <span className="flex items-center gap-1">
          <Heart className="h-3 w-3" /> {post.like_count}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" /> {post.comment_count}
        </span>
      </div>
    </Link>
  );
}
