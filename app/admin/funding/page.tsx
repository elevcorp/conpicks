import Link from "next/link";
import { listFundingCampaigns, listTeasers } from "@/lib/data";
import { krw } from "@/lib/format";
import { CampaignControls, CampaignCreate } from "./CampaignControls";

export const metadata = { title: "펀딩 관리" };

export default async function AdminFundingPage() {
  const [campaigns, published] = await Promise.all([
    listFundingCampaigns(),
    listTeasers({ sort: "rank", limit: 20 }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold">펀딩 관리</h1>

      <ul className="space-y-3">
        {campaigns.map(({ campaign, teaser, pledgeCount }) => (
          <li
            key={campaign.id}
            className="space-y-2 rounded-xl border border-border bg-bg-elevated p-4"
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/funding/${campaign.id}`}
                className="text-sm font-bold hover:underline"
              >
                {teaser.teaser.title}
              </Link>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold">
                {campaign.status}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              {campaign.type} · {krw(campaign.raised_krw)} / {krw(campaign.goal_krw)}{" "}
              · 참여 {pledgeCount}명
            </p>
            <CampaignControls id={campaign.id} status={campaign.status} />
          </li>
        ))}
      </ul>

      <section className="space-y-3 rounded-xl border border-border bg-bg-elevated p-4">
        <h2 className="text-sm font-bold">새 캠페인 (우승작 대상)</h2>
        <CampaignCreate
          teasers={published.items.map((t) => ({
            id: t.teaser.id,
            title: t.teaser.title,
            rank: t.stats.rank,
          }))}
        />
      </section>
    </div>
  );
}
