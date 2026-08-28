import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getCampaign, getSettingInt } from "@/lib/data";
import { dday, krw } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { PledgeBox } from "./PledgeBox";

export default async function FundingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, user, minPledge] = await Promise.all([
    getCampaign(id),
    getSessionUser(),
    getSettingInt("FUNDING_MIN_PLEDGE_KRW", 10000),
  ]);
  if (!data) notFound();
  const { campaign, teaser, pledges, revenue, payouts } = data;
  const pct = Math.min(
    100,
    Math.round((campaign.raised_krw / campaign.goal_krw) * 100),
  );
  const myPledges = pledges.filter((p) => p.user_id === user?.id);
  const myPayout = payouts.find((p) => p.user_id === user?.id);
  const totalRevenue = revenue.reduce((s, r) => s + r.amount_krw, 0);

  return (
    <div className="space-y-5 pb-10">
      <Link href="/" className="text-xs text-text-muted">
        ← 홈
      </Link>

      <div className="relative aspect-video overflow-hidden rounded-xl">
        <Image
          src={teaser.teaser.thumbnail_url}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div>
        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-text-secondary">
          {campaign.type === "revenue_share" ? "수익배분형" : "리워드형"}
        </span>
        <h1 className="mt-1 text-xl font-extrabold">{teaser.teaser.title}</h1>
        <p className="text-sm text-text-muted">{teaser.teaser.logline}</p>
      </div>

      <div className="space-y-2">
        <Progress value={pct} className="h-2" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-gradient font-bold">{pct}%</span>
          <span>
            {krw(campaign.raised_krw)}{" "}
            <span className="text-text-muted">/ {krw(campaign.goal_krw)}</span>
          </span>
          <span className="text-text-muted">{dday(campaign.ends_at)}</span>
        </div>
        <p className="text-xs text-text-muted">
          참여자 {pledges.length}명 · 상태 {campaign.status}
        </p>
      </div>

      {campaign.status === "open" ? (
        <PledgeBox
          campaignId={campaign.id}
          min={minPledge}
          loggedIn={!!user}
        />
      ) : (
        <p className="rounded-lg border border-border bg-bg-elevated p-3 text-sm text-text-muted">
          현재 참여할 수 없는 캠페인입니다. (상태: {campaign.status})
        </p>
      )}

      {myPledges.length > 0 && (
        <section className="space-y-1.5 rounded-xl border border-brand-to/40 bg-brand-to/5 p-4 text-sm">
          <p className="font-bold">내 참여 내역</p>
          <p className="text-text-secondary">
            참여금 합계{" "}
            {krw(myPledges.reduce((s, p) => s + p.amount_krw, 0))}
          </p>
          <p className="text-text-secondary">
            누적 수익 {krw(totalRevenue)} · 내 배분액{" "}
            <span className="font-semibold text-brand-accent">
              {myPayout ? krw(myPayout.amount_krw) : "정산 전"}
            </span>
            {myPayout &&
              ` · ${myPayout.status === "paid" ? "지급 완료" : "지급 대기"}`}
          </p>
        </section>
      )}

      <section className="space-y-1.5 text-xs whitespace-pre-line text-text-muted">
        <h2 className="text-sm font-bold text-text-secondary">약관</h2>
        {campaign.terms_md}
        {campaign.type === "revenue_share" && (
          <p className="mt-2 rounded bg-danger/10 p-2 text-danger">
            ⚠️ 수익 배분을 약속하는 대중 펀딩은 자본시장법상 투자형(증권형)
            크라우드펀딩으로 해석될 소지가 있어, 실제 운영 전 등록 중개업자
            연동 또는 구조 검토가 필요합니다.
          </p>
        )}
      </section>
    </div>
  );
}
