"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AuthorVM {
  id: string;
  nickname: string;
  avatar_url: string | null;
  role: string;
}
interface CommentVM {
  comment: {
    id: string;
    body: string;
    like_count: number;
    created_at: string;
    parent_id: string | null;
  };
  author: AuthorVM;
  replies?: CommentVM[];
}

export function CommentSection({
  teaserId,
  count,
  loggedIn,
}: {
  teaserId: string;
  count: number;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [sort, setSort] = useState<"top" | "new">("top");
  const [items, setItems] = useState<CommentVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(
      `/api/teasers/${teaserId}/comments?sort=${sort}`,
    );
    const json = await res.json();
    setItems(json.items ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, teaserId]);

  async function submit() {
    if (!loggedIn) {
      toast.error("로그인이 필요합니다.", {
        action: { label: "로그인", onClick: () => router.push("/login") },
      });
      return;
    }
    if (body.trim().length === 0) return;
    setPosting(true);
    const res = await fetch(`/api/teasers/${teaserId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, parentId: replyTo }),
    });
    setPosting(false);
    if (res.ok) {
      setBody("");
      setReplyTo(null);
      load();
    } else {
      toast.error("댓글 등록에 실패했어요.");
    }
  }

  async function likeComment(id: string) {
    if (!loggedIn) return router.push("/login");
    setItems((cur) => bump(cur, id));
    await fetch(`/api/comments/${id}/like`, { method: "POST" });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">댓글 {count}</h3>
        <div className="flex gap-1 text-xs">
          {(["top", "new"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                "rounded-full px-2.5 py-1",
                sort === s
                  ? "bg-white/10 text-text-primary"
                  : "text-text-muted",
              )}
            >
              {s === "top" ? "인기순" : "최신순"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder={
            replyTo ? "답글을 입력하세요" : "이 티저에 대한 생각을 남겨보세요"
          }
          className="flex-1"
        />
        <Button onClick={submit} disabled={posting} className="self-end">
          등록
        </Button>
      </div>
      {replyTo && (
        <button
          className="text-xs text-text-muted underline"
          onClick={() => setReplyTo(null)}
        >
          답글 취소
        </button>
      )}

      {loading ? (
        <p className="py-6 text-center text-sm text-text-muted">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">
          첫 댓글을 남겨보세요.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((c) => (
            <li key={c.comment.id} className="space-y-2">
              <Row
                vm={c}
                onLike={() => likeComment(c.comment.id)}
                onReply={() => setReplyTo(c.comment.id)}
              />
              {c.replies && c.replies.length > 0 && (
                <ul className="ml-10 space-y-3 border-l border-border pl-3">
                  {c.replies.map((r) => (
                    <li key={r.comment.id}>
                      <Row vm={r} onLike={() => likeComment(r.comment.id)} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Row({
  vm,
  onLike,
  onReply,
}: {
  vm: CommentVM;
  onLike: () => void;
  onReply?: () => void;
}) {
  return (
    <div className="flex gap-3">
      <Image
        src={vm.author.avatar_url ?? "/icon.svg"}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-full bg-bg-elevated"
        unoptimized
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold">{vm.author.nickname}</span>
          {(vm.author.role === "creator" || vm.author.role === "admin") && (
            <span className="rounded bg-brand-accent/15 px-1 text-[9px] font-bold text-brand-accent">
              Creator
            </span>
          )}
          <span className="text-[11px] text-text-muted">
            {timeAgo(vm.comment.created_at)}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-text-secondary">{vm.comment.body}</p>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-text-muted">
          <button onClick={onLike} className="flex items-center gap-1">
            <Heart className="h-3 w-3" /> {vm.comment.like_count}
          </button>
          {onReply && <button onClick={onReply}>답글</button>}
        </div>
      </div>
    </div>
  );
}

function bump(list: CommentVM[], id: string): CommentVM[] {
  return list.map((c) => {
    if (c.comment.id === id)
      return {
        ...c,
        comment: { ...c.comment, like_count: c.comment.like_count + 1 },
      };
    if (c.replies) return { ...c, replies: bump(c.replies, id) };
    return c;
  });
}
