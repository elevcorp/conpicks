"use client";

import { Flag, Heart, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { timeAgo } from "@/lib/format";

interface CommentVM {
  comment: { id: string; body: string; created_at: string };
  author: { nickname: string; avatar_url: string | null; role: string };
}

export function PostInteractions({
  postId,
  initialLikes,
  initialComments,
  loggedIn,
  currentUser,
}: {
  postId: string;
  initialLikes: number;
  initialComments: CommentVM[];
  loggedIn: boolean;
  currentUser: { nickname: string; avatar_url: string | null } | null;
}) {
  const router = useRouter();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  function requireLogin() {
    toast.error("로그인이 필요합니다.", {
      action: { label: "로그인", onClick: () => router.push("/login") },
    });
  }

  async function like() {
    if (!loggedIn) return requireLogin();
    setLiked((v) => !v);
    setLikes((n) => n + (liked ? -1 : 1));
    const r = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    if (r.ok) {
      const j = await r.json();
      setLiked(j.liked);
      setLikes(j.count);
    }
  }

  async function comment() {
    if (!loggedIn) return requireLogin();
    if (!body.trim()) return;
    setPosting(true);
    const r = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setPosting(false);
    if (r.ok) {
      const j = await r.json();
      setComments((cur) => [
        ...cur,
        {
          comment: j.comment,
          author: {
            nickname: currentUser?.nickname ?? "나",
            avatar_url: currentUser?.avatar_url ?? null,
            role: "viewer",
          },
        },
      ]);
      setBody("");
    }
  }

  async function report() {
    if (!loggedIn) return requireLogin();
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "post",
        targetId: postId,
        reason: "부적절한 게시물",
      }),
    });
    toast.success("신고가 접수됐어요.");
  }

  return (
    <div className="space-y-5 border-t border-border pt-4">
      <div className="flex items-center gap-3">
        <button
          onClick={like}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
            liked
              ? "border-danger text-danger"
              : "border-border text-text-secondary"
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-danger" : ""}`} /> {likes}
        </button>
        <span className="flex items-center gap-1.5 text-sm text-text-muted">
          <MessageSquare className="h-4 w-4" /> {comments.length}
        </span>
        <button
          onClick={report}
          className="ml-auto flex items-center gap-1 text-xs text-text-muted"
        >
          <Flag className="h-3.5 w-3.5" /> 신고
        </button>
      </div>

      <div className="flex gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="댓글 달기"
          className="flex-1"
        />
        <Button onClick={comment} disabled={posting} className="self-end">
          등록
        </Button>
      </div>

      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.comment.id} className="flex gap-3">
            <Image
              src={c.author.avatar_url ?? "/icon.svg"}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full bg-bg-elevated"
              unoptimized
            />
            <div>
              <p className="text-xs">
                <span className="font-semibold">{c.author.nickname}</span>{" "}
                <span className="text-text-muted">
                  {timeAgo(c.comment.created_at)}
                </span>
              </p>
              <p className="text-sm text-text-secondary">{c.comment.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
