import Link from "next/link";
import {
  getCreatorTeasers,
  getNotifications,
  getUserComments,
  getUserPledges,
} from "@/lib/data";
import { krw, timeAgo } from "@/lib/format";
import { EmptyState } from "@/components/common/EmptyState";

const STATUS_LABEL: Record<string, string> = {
  draft: "임시저장",
  submitted: "심사 대기",
  in_review: "심사 중",
  approved: "승인 (공개 대기)",
  rejected: "반려",
  hidden: "숨김",
  published: "공개 중",
};

export function MyComments({
  items,
}: {
  items: Awaited<ReturnType<typeof getUserComments>>;
}) {
  if (items.length === 0) return <EmptyState title="작성한 댓글이 없어요" />;
  return (
    <ul className="space-y-2">
      {items.map(({ comment, teaser }) => (
        <li
          key={comment.id}
          className="rounded-lg border border-border bg-bg-elevated p-3"
        >
          <p className="text-sm text-text-secondary">{comment.body}</p>
          <p className="mt-1 text-[11px] text-text-muted">
            {teaser ? (
              <Link href={`/t/${teaser.slug}`} className="underline">
                {teaser.title}
              </Link>
            ) : (
              "삭제된 작품"
            )}{" "}
            · {timeAgo(comment.created_at)}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function MyFunding({
  items,
}: {
  items: Awaited<ReturnType<typeof getUserPledges>>;
}) {
  if (items.length === 0)
    return (
      <EmptyState
        title="참여한 펀딩이 없어요"
        description="우승작 펀딩이 열리면 참여할 수 있어요."
      />
    );
  return (
    <ul className="space-y-3">
      {items.map(({ pledge, campaign, teaser, payout }) => (
        <li
          key={pledge.id}
          className="space-y-1 rounded-xl border border-border bg-bg-elevated p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{teaser?.title ?? "작품"}</p>
            <span className="text-[11px] text-text-muted">
              {campaign.type === "revenue_share" ? "수익배분형" : "리워드형"}
            </span>
          </div>
          <p className="text-xs text-text-muted">
            참여금 {krw(pledge.amount_krw)} ·{" "}
            {pledge.status === "confirmed"
              ? "확정"
              : pledge.status === "pending"
                ? "입금 확인 중"
                : "환불"}
          </p>
          <p className="text-xs">
            예상/확정 배분:{" "}
            <span className="font-semibold text-brand-accent">
              {payout ? krw(payout.amount_krw) : "정산 전"}
            </span>
            {payout && ` · ${payout.status === "paid" ? "지급 완료" : "지급 대기"}`}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function MyWorks({
  items,
}: {
  items: Awaited<ReturnType<typeof getCreatorTeasers>>;
}) {
  if (items.length === 0)
    return (
      <EmptyState
        title="아직 올린 작품이 없어요"
        description="첫 티저를 업로드해 보세요."
        action={
          <Link
            href="/upload"
            className="bg-brand-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white"
          >
            작품 올리기
          </Link>
        }
      />
    );
  return (
    <ul className="space-y-3">
      {items.map(({ teaser, stats, rejectionReason }) => (
        <li
          key={teaser.id}
          className="space-y-2 rounded-xl border border-border bg-bg-elevated p-4"
        >
          <div className="flex items-center justify-between">
            <Link
              href={`/t/${teaser.slug}`}
              className="text-sm font-bold underline-offset-2 hover:underline"
            >
              {teaser.title}
            </Link>
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                teaser.status === "published"
                  ? "bg-success/15 text-success"
                  : teaser.status === "rejected"
                    ? "bg-danger/15 text-danger"
                    : "bg-white/10 text-text-secondary"
              }`}
            >
              {STATUS_LABEL[teaser.status]}
            </span>
          </div>

          {teaser.status === "published" && (
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                ["순위", stats.rank > 0 ? `${stats.rank}위` : "-"],
                ["좋아요", stats.like_count],
                ["공유", stats.share_count],
                ["저장", stats.save_count],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-black/20 py-2">
                  <p className="text-sm font-bold">{v}</p>
                  <p className="text-[10px] text-text-muted">{k}</p>
                </div>
              ))}
            </div>
          )}

          {teaser.status === "published" && (
            <p className="text-[11px] text-text-muted">
              조회 {stats.view_start} · 완주 {stats.view_complete} · 댓글{" "}
              {stats.comment_count} · 7일/30일 추이 그래프는 준비 중
            </p>
          )}

          {rejectionReason && (
            <p className="rounded-lg bg-danger/10 p-2 text-xs text-danger">
              반려 사유: {rejectionReason}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

export function MyNotifications({
  items,
}: {
  items: Awaited<ReturnType<typeof getNotifications>>;
}) {
  if (items.length === 0)
    return <EmptyState title="알림이 없어요" />;
  const text = (n: (typeof items)[number]) => {
    switch (n.type) {
      case "review_approved":
        return "작품이 승인되어 공개됐어요 🎉";
      case "review_rejected":
        return `작품이 반려됐어요${
          n.payload.reason ? ` — ${n.payload.reason}` : ""
        }`;
      case "comment":
        return `내 작품에 새 댓글: "${n.payload.preview ?? ""}"`;
      case "rank_enter":
        return `축하해요! 작품이 Top 10 (${n.payload.rank}위)에 진입했어요`;
      case "funding":
        return "펀딩 관련 알림이 있어요";
      default:
        return "새 알림";
    }
  };
  return (
    <ul className="space-y-2">
      {items.map((n) => (
        <li
          key={n.id}
          className={`rounded-lg border p-3 text-sm ${
            n.read_at
              ? "border-border bg-bg-elevated/40 text-text-muted"
              : "border-brand-to/40 bg-brand-to/5 text-text-secondary"
          }`}
        >
          {text(n)}
          <span className="ml-2 text-[11px] text-text-muted">
            {timeAgo(n.created_at)}
          </span>
        </li>
      ))}
    </ul>
  );
}
