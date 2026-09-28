import { getAdminDashboard } from "@/lib/data";
import { krw } from "@/lib/format";

export const metadata = { title: "관리자 대시보드" };

export default async function AdminDashboard() {
  const d = await getAdminDashboard();
  const cards: [string, string | number][] = [
    ["전체 유저", d.users],
    ["창작자", d.creators],
    ["총 업로드", d.uploads],
    ["공개 중", d.published],
    ["심사 대기", d.submitted],
    ["반려", d.rejected],
    ["총 좋아요", d.totalLikes],
    ["총 공유", d.totalShares],
    ["총 댓글", d.totalComments],
    ["펀딩 모금액", krw(d.fundingRaised)],
  ];
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-extrabold">대시보드</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-bg-elevated p-4"
          >
            <p className="text-xs text-text-muted">{label}</p>
            <p className="mt-1 text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-text-muted">
        DAU 등 시계열 지표는 이벤트 로깅 연동(2차) 후 표시됩니다.
      </p>
    </div>
  );
}
