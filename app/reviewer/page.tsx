import { getSessionUser } from "@/lib/auth";
import { getReviewQueue, getSettingInt } from "@/lib/data";
import { EmptyState } from "@/components/common/EmptyState";
import { ReviewCard } from "./ReviewCard";

export const metadata = { title: "심사 대기열" };

export default async function ReviewerQueuePage() {
  const [user, queue, required] = await Promise.all([
    getSessionUser(),
    getReviewQueue(),
    getSettingInt("REVIEW_APPROVALS_REQUIRED", 2),
  ]);

  const pending = queue.filter((q) => q.teaser.status !== "published");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold">
          심사 대기 <span className="text-brand-gradient">{pending.length}</span>
        </h1>
        <p className="text-xs text-text-muted">
          승인 {required}인 → 자동 공개 · 반려 1인 → 반려
        </p>
      </div>

      {pending.length === 0 ? (
        <EmptyState title="대기 중인 작품이 없어요" description="새 제출이 오면 여기에 표시됩니다." />
      ) : (
        <ul className="space-y-5">
          {pending.map((q) => (
            <li key={q.teaser.id}>
              <ReviewCard
                teaser={q.teaser}
                creator={q.creator}
                reviews={q.reviews}
                myId={user!.id}
                required={required}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
