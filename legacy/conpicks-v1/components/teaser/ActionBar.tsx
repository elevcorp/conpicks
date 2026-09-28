"use client";

import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { compactCount } from "@/lib/format";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

interface Props {
  teaserId: string;
  slug: string;
  initial: {
    like: number;
    comment: number;
    share: number;
    save: number;
    liked: boolean;
    saved: boolean;
  };
  loggedIn: boolean;
  ownTeaser: boolean;
  onCommentClick?: () => void;
  layout?: "row" | "column";
}

export function ActionBar({
  teaserId,
  slug,
  initial,
  loggedIn,
  ownTeaser,
  onCommentClick,
  layout = "row",
}: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(initial.liked);
  const [saved, setSaved] = useState(initial.saved);
  const [likeN, setLikeN] = useState(initial.like);
  const [saveN, setSaveN] = useState(initial.save);
  const [shareN, setShareN] = useState(initial.share);
  const [busy, setBusy] = useState(false);

  function guard(): boolean {
    if (!loggedIn) {
      toast.error("로그인이 필요합니다.", {
        action: { label: "로그인", onClick: () => router.push("/login") },
      });
      return false;
    }
    if (ownTeaser) {
      toast("본인 작품에는 반응할 수 없어요.");
      return false;
    }
    return true;
  }

  async function hit(path: string, body?: unknown) {
    const res = await fetch(`/api/teasers/${teaserId}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function onLike() {
    if (!guard() || busy) return;
    setBusy(true);
    setLiked((v) => !v);
    setLikeN((n) => n + (liked ? -1 : 1));
    try {
      const r = await hit("like");
      setLiked(r.liked);
      setLikeN(r.count);
    } catch {
      setLiked(initial.liked);
      setLikeN(initial.like);
      toast.error("잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    if (!guard() || busy) return;
    setBusy(true);
    setSaved((v) => !v);
    setSaveN((n) => n + (saved ? -1 : 1));
    try {
      const r = await hit("save");
      setSaved(r.saved);
      setSaveN(r.count);
      toast.success(r.saved ? "저장했어요" : "저장을 취소했어요");
    } catch {
      setSaved(initial.saved);
      setSaveN(initial.save);
    } finally {
      setBusy(false);
    }
  }

  async function onShare(channel: "kakao" | "link" | "x") {
    const url = `${env.siteUrl}/t/${slug}`;
    try {
      if (channel === "link") {
        if (navigator.share) await navigator.share({ url });
        else {
          await navigator.clipboard.writeText(url);
          toast.success("링크를 복사했어요");
        }
      } else if (channel === "x") {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
          "_blank",
        );
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("링크를 복사했어요 (카카오 공유는 앱에서)");
      }
      const r = await hit("share", { channel });
      setShareN(r.count);
    } catch {
      /* user cancelled share sheet */
    }
  }

  const wrap =
    layout === "column"
      ? "flex flex-col items-center gap-4"
      : "flex items-center justify-around gap-1 rounded-xl border border-border bg-bg-elevated/60 py-2";

  const btn =
    layout === "column"
      ? "flex flex-col items-center gap-1 text-white"
      : "flex flex-1 flex-col items-center gap-1 py-1 text-text-secondary";

  return (
    <div className={wrap}>
      <button onClick={onLike} className={btn} aria-pressed={liked}>
        <Heart
          className={cn(
            "h-6 w-6 transition-colors",
            liked && "fill-danger text-danger",
          )}
        />
        <span className="text-[11px] tabular-nums">{compactCount(likeN)}</span>
      </button>

      <button
        onClick={
          onCommentClick ??
          (() =>
            document
              .getElementById("comments")
              ?.scrollIntoView({ behavior: "smooth" }))
        }
        className={btn}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="text-[11px] tabular-nums">
          {compactCount(initial.comment)}
        </span>
      </button>

      <Popover>
        <PopoverTrigger className={btn}>
          <Share2 className="h-6 w-6" />
          <span className="text-[11px] tabular-nums">
            {compactCount(shareN)}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1">
          {(
            [
              ["link", "링크 복사 / 공유"],
              ["kakao", "카카오톡"],
              ["x", "X (트위터)"],
            ] as const
          ).map(([ch, label]) => (
            <button
              key={ch}
              onClick={() => onShare(ch)}
              className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-white/5"
            >
              {label}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <button onClick={onSave} className={btn} aria-pressed={saved}>
        <Bookmark
          className={cn(
            "h-6 w-6 transition-colors",
            saved && "fill-brand-accent text-brand-accent",
          )}
        />
        <span className="text-[11px] tabular-nums">{compactCount(saveN)}</span>
      </button>
    </div>
  );
}
