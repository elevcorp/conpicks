import Image from "next/image";
import Link from "next/link";
import { dday, krw } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import type { FundingCampaign, TeaserCardVM } from "@/lib/types";

export function FundingCard({
  campaign,
  teaser,
}: {
  campaign: FundingCampaign;
  teaser: TeaserCardVM;
}) {
  const pct = Math.min(
    100,
    Math.round((campaign.raised_krw / campaign.goal_krw) * 100),
  );
  return (
    <Link
      href={`/funding/${campaign.id}`}
      className="flex w-72 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated"
    >
      <div className="relative aspect-video">
        <Image
          src={teaser.teaser.thumbnail_url}
          alt={teaser.teaser.title}
          fill
          sizes="288px"
          className="object-cover"
        />
        <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
          {campaign.type === "revenue_share" ? "수익배분형" : "리워드형"}
        </span>
        <span className="absolute top-2 right-2 rounded bg-brand-accent/90 px-2 py-0.5 text-[10px] font-bold text-black">
          {dday(campaign.ends_at)}
        </span>
      </div>
      <div className="space-y-2 p-3">
        <p className="line-clamp-1 text-sm font-bold">{teaser.teaser.title}</p>
        <Progress value={pct} className="h-1.5" />
        <div className="flex items-center justify-between text-xs">
          <span className="text-brand-gradient font-bold">{pct}%</span>
          <span className="text-text-muted">{krw(campaign.raised_krw)}</span>
        </div>
      </div>
    </Link>
  );
}
