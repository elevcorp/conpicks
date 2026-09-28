"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, Send } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Sheet } from "@/components/common/Sheet";
import { useRequireLogin } from "@/components/common/LoginSheet";
import { useUser } from "@/store/user";
import { useUI, demoToast } from "@/store/ui";
import { cn } from "@/lib/cn";
import { won } from "@/lib/format";
import type { Comment } from "@/lib/types";

/** Kakao-style comments: BEST top 4, spoiler fold, pill votes. `themed` → work-theme tokens. */
export function CommentList({ workId, comments, total, themed, defaultEpisode = "1화" }: {
  workId: string; comments: Comment[]; total: number; themed?: boolean; defaultEpisode?: string;
}) {
  const [sort, setSort] = useState<"best" | "new">("best");
  const [menu, setMenu] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const mine = useUser((s) => s.myComments).filter((c) => c.workId === workId);
  const { addComment, nickname } = useUser();
  const requireLogin = useRequireLogin();
  const toast = useUI((s) => s.toast);

  const list = useMemo(() => {
    const own: Comment[] = mine.map((c) => ({ id: c.id, nickname, date: "방금", body: c.body, episode: c.episode, likes: 0, dislikes: 0, replies: 0, isBest: false, isSpoiler: false }));
    const best = comments.filter((c) => c.isBest);
    const rest = comments.filter((c) => !c.isBest);
    return sort === "best" ? [...best, ...own, ...rest] : [...own, ...[...rest].reverse(), ...best];
  }, [comments, mine, nickname, sort]);

  const post = () =>
    requireLogin(() => {
      if (!draft.trim()) return;
      addComment({ id: `me-${Date.now()}`, workId, body: draft.trim(), episode: defaultEpisode });
      setDraft("");
      toast("댓글이 등록되었어요", "success");
    });

  const line = themed ? "border-w-line" : "border-line";
  const sub = themed ? "text-w-fg3" : "text-fg-3";
  const pill = themed ? "bg-w-chip" : "bg-chip";

  return (
    <div>
      <div className="flex items-center justify-between py-3">
        <p className="text-[15px] font-bold">
          댓글 <span className={sub}>{won(total + mine.length)}</span>
        </p>
        <div className={cn("flex rounded-full p-0.5 text-[13px] font-semibold", pill)}>
          {(["best", "new"] as const).map((s) => (
            <button key={s} onClick={() => setSort(s)} className={cn("h-7 rounded-full px-3 transition-colors", sort === s ? "bg-white text-ink" : sub)}>
              {s === "best" ? "BEST순" : "최신순"}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("mb-2 flex items-center gap-2 rounded-2xl px-4 py-2", pill)}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && post()}
          onFocus={() => requireLogin(() => {})}
          placeholder="작품에 대한 따뜻한 한마디를 남겨주세요"
          className="h-9 flex-1 bg-transparent text-[14px] outline-none placeholder:opacity-50"
          aria-label="댓글 입력"
        />
        <button onClick={post} aria-label="등록" className={cn("grid size-9 place-items-center rounded-full transition-colors", draft.trim() ? "bg-brand text-white" : sub)}>
          <Send size={16} />
        </button>
      </div>

      <ul>
        <AnimatePresence initial={false}>
          {list.map((c) => (
            <motion.li key={c.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={cn("border-b py-4", line)}>
              <CommentItem c={c} sub={sub} pill={pill} onMore={() => setMenu(c.id)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <Sheet open={!!menu} onClose={() => setMenu(null)}>
        <ul className="py-3">
          {["신고하기", "이 사용자의 댓글 숨기기", "답글 알림 받기"].map((t) => (
            <li key={t}>
              <button onClick={() => { setMenu(null); demoToast(`${t} 완료`); }} className="h-14 w-full text-left text-[16px] font-semibold">
                {t}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  );
}

function CommentItem({ c, sub, pill, onMore }: { c: Comment; sub: string; pill: string; onMore: () => void }) {
  const [open, setOpen] = useState(!c.isSpoiler);
  const vote = useUser((s) => s.commentVotes[c.id]);
  const voteComment = useUser((s) => s.voteComment);
  const requireLogin = useRequireLogin();
  const toast = useUI((s) => s.toast);
  const likes = c.likes + (vote === "up" ? 1 : 0);
  const dislikes = c.dislikes + (vote === "down" ? 1 : 0);

  return (
    <div>
      <div className="flex items-center gap-1.5">
        {c.isBest && <Badge label="BEST" />}
        <span className="text-[14px] font-bold">{c.nickname}</span>
        <span className={cn("text-[12px]", sub)}>{c.date}</span>
        <button onClick={onMore} aria-label="더보기" className={cn("-mr-2 ml-auto grid size-8 place-items-center rounded-full", sub)}>
          <MoreVertical size={16} />
        </button>
      </div>
      {open ? (
        <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed" style={{ wordBreak: "keep-all" }}>
          {c.isSpoiler && <span className="mr-1 rounded bg-up/20 px-1 py-0.5 text-[11px] font-bold text-up">스포</span>}
          {c.body}
        </p>
      ) : (
        <button onClick={() => setOpen(true)} className={cn("mt-2 flex w-full items-center justify-between rounded-xl px-4 py-3 text-[14px] font-semibold", pill)}>
          스포일러가 포함된 댓글 보기 <ChevronDown size={16} />
        </button>
      )}
      <div className="mt-2.5 flex items-center gap-1.5">
        <span className={cn("mr-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold", pill, sub)}>{c.episode}</span>
        <button
          onClick={() => requireLogin(() => voteComment(c.id, "up"))}
          className={cn("flex h-8 items-center gap-1 rounded-full px-3 text-[12.5px] font-semibold transition-colors", vote === "up" ? "bg-brand text-white" : pill)}
        >
          <ThumbsUp size={13} /> 좋아요 {won(likes)}
        </button>
        <button
          onClick={() => requireLogin(() => voteComment(c.id, "down"))}
          className={cn("flex h-8 items-center gap-1 rounded-full px-3 text-[12.5px] font-semibold transition-colors", vote === "down" ? "bg-fg-3 text-white" : pill)}
        >
          <ThumbsDown size={13} /> 싫어요 {won(dislikes)}
        </button>
        <button onClick={() => toast(`답글 ${c.replies}개 · 정식 오픈 시 스레드로 제공돼요`)} className={cn("flex h-8 items-center gap-1 rounded-full px-3 text-[12.5px] font-semibold", pill)}>
          <MessageSquare size={13} /> 답글 {c.replies}
        </button>
      </div>
    </div>
  );
}
