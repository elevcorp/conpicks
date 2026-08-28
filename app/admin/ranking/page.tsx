import { getActiveSeason, getRankingConfig } from "@/lib/data";
import { RankingConfigForm } from "./RankingConfigForm";

export const metadata = { title: "랭킹 설정" };

export default async function RankingSettingsPage() {
  const season = await getActiveSeason();
  const cfg = await getRankingConfig(season.id);
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-extrabold">랭킹 설정</h1>
      <p className="text-xs text-text-muted">
        가중치·시간감쇠를 저장하면 다음 재계산 주기(5분)부터 반영됩니다.
        시즌: {season.name}
      </p>
      <RankingConfigForm initial={cfg} />
    </div>
  );
}
