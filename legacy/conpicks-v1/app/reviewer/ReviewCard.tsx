"use client";

import { Check, Pause, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/lib/actions/review";
import { runtime } from "@/lib/format";
import type { Review, Teaser } from "@/lib/types";
import { cn } from "@/lib/utils";

const REJECT_TEMPLATES = [
  "저작권 확인 필요 — 사용 음원/영상 라이선스 증빙을 첨부해 재제출 바랍니다.",
  "영상 길이 규정(90~240초) 미충족.",
  "완성도 부족 — 화면 전환/사운드 믹싱을 보완해 주세요.",
  "가이드라인 위반 소재 포함.",
];

export function ReviewCard({
  teaser,
  creator,
  reviews,
  myId,
  required,
}: {
  teaser: Teaser;
  creator: { nickname: string };
  reviews: Review[];
  myId: string;
  required: number;
}) {
  const mine = reviews.find((r) => r.reviewer_id === myId);
  const approvals = reviews.filter((r) => r.decision === "approve").length;

  const [decision, setDecision] = useState<mineT | null>(
    (mine?.decision as mineT) ?? null,
  );
  const [reason, setReason] = useState(mine?.reason ?? "");
  const [scores, setScores] = useState({
    story: mine?.score_story ?? 0,
    visual: mine?.score_visual ?? 0,
    polish: mine?.score_polish ?? 0,
  });
  const [pending, start] = useTransition();

  function act(d: mineT) {
    if (d === "reject" && !reason.trim()) {
      setDecision("reject");
      toast.error("반려 사유를 입력해 주세요.");
      return;
    }
    start(async () => {
      try {
        const r = await submitReview({
          teaserId: teaser.id,
          decision: d,
          reason: d === "reject" ? reason : undefined,
          scores:
            scores.story || scores.visual || scores.polish ? scores : undefined,
        });
        setDecision(d);
        toast.success(
          r.status === "published"
            ? "승인 완료 — 작품이 공개됐어요."
            : r.status === "rejected"
              ? "반려 처리했어요."
              : `승인 ${r.approvals}/${r.required} · 저장됨`,
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "처리 실패");
      }
    });
  }

  return (
    <article className="space-y-3 rounded-xl border border-border bg-bg-elevated p-4">
      <video
        src={teaser.playback_url}
        poster={teaser.poster_url}
        controls
        className="aspect-video w-full rounded-lg bg-black"
      />
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-bold">{teaser.title}</h2>
          <p className="text-xs text-text-muted">
            {creator.nickname} · {runtime(teaser.duration_sec)} ·{" "}
            {teaser.genres.join(", ")}
          </p>
        </div>
        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-text-secondary">
          승인 {approvals}/{required}
        </span>
      </div>
      <p className="text-sm text-text-secondary">{teaser.logline}</p>
      {teaser.synopsis && (
        <p className="line-clamp-3 text-xs whitespace-pre-line text-text-muted">
          {teaser.synopsis}
        </p>
      )}
      <p className="text-[11px] text-text-muted">
        AI 툴 · {teaser.ai_tools.join(", ") || "미기재"}
      </p>

      {/* optional scoring for the prediction model */}
      <div className="grid grid-cols-3 gap-2">
        {(["story", "visual", "polish"] as const).map((k) => (
          <div key={k} className="space-y-1">
            <p className="text-[10px] text-text-muted">
              {k === "story" ? "스토리" : k === "visual" ? "비주얼" : "완성도"}
            </p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setScores((s) => ({ ...s, [k]: n }))}
                  className={cn(
                    "h-6 flex-1 rounded text-[10px]",
                    scores[k] >= n
                      ? "bg-brand-to text-white"
                      : "bg-white/5 text-text-muted",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {(decision === "reject" || (!decision && reason)) && (
        <div className="space-y-1.5">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="반려 사유 (필수)"
          />
          <div className="flex flex-wrap gap-1.5">
            {REJECT_TEMPLATES.map((t) => (
              <button
                key={t}
                onClick={() => setReason(t)}
                className="rounded border border-border px-2 py-0.5 text-[10px] text-text-muted"
              >
                {t.slice(0, 12)}…
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          disabled={pending}
          onClick={() => act("approve")}
        >
          <Check className="h-4 w-4" /> 승인
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="flex-1"
          disabled={pending}
          onClick={() => act("reject")}
        >
          <X className="h-4 w-4" /> 반려
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => act("hold")}
        >
          <Pause className="h-4 w-4" /> 보류
        </Button>
      </div>
      {mine && (
        <p className="text-center text-[11px] text-text-muted">
          내 결정: {labelOf(decision)}
        </p>
      )}
    </article>
  );
}

type mineT = "approve" | "reject" | "hold";
function labelOf(d: mineT | null) {
  return d === "approve"
    ? "승인"
    : d === "reject"
      ? "반려"
      : d === "hold"
        ? "보류"
        : "-";
}
