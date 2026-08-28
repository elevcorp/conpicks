import { listFundingCampaigns, getCampaign } from "@/lib/data";
import { SettlementPanel } from "./SettlementPanel";

export const metadata = { title: "정산" };

export default async function AdminSettlementPage() {
  const campaigns = await listFundingCampaigns();
  const detailed = await Promise.all(
    campaigns.map((c) => getCampaign(c.campaign.id)),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold">정산 (Back office)</h1>
      <p className="text-xs text-text-muted">
        작품별 수익 입력 → 배분 비율 설정 → 참여자별 배분액 자동 계산 → 지급
        상태 관리 → CSV 내보내기.
      </p>
      {detailed.filter(Boolean).map((d) => (
        <SettlementPanel
          key={d!.campaign.id}
          campaignId={d!.campaign.id}
          title={d!.teaser.teaser.title}
          teaserId={d!.campaign.teaser_id}
          revenue={d!.revenue}
          pledges={d!.pledges.map((p) => ({
            id: p.id,
            user_id: p.user_id,
            amount_krw: p.amount_krw,
            status: p.status,
          }))}
          payouts={d!.payouts.map((p) => ({
            id: p.id,
            user_id: p.user_id,
            amount_krw: p.amount_krw,
            status: p.status,
          }))}
        />
      ))}
    </div>
  );
}
