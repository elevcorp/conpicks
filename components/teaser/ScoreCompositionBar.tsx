import type { RankingWeights } from "@/lib/ranking/score";
import type { TeaserStats } from "@/lib/types";

/** Mini stacked bar: which signals are driving this teaser's score. */
export function ScoreCompositionBar({
  stats,
  weights,
}: {
  stats: TeaserStats;
  weights: RankingWeights;
}) {
  const parts = [
    { key: "공유", value: stats.share_count * weights.w_share, color: "#0072D2" },
    { key: "저장", value: stats.save_count * weights.w_save, color: "#8A5CF6" },
    { key: "좋아요", value: stats.like_count * weights.w_like, color: "#21D3EE" },
    { key: "댓글", value: stats.comment_count * weights.w_comment, color: "#34D399" },
    {
      key: "완주",
      value:
        stats.view_complete * weights.w_complete +
        stats.view_half * weights.w_half,
      color: "#FF9F5C",
    },
  ];
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;

  return (
    <div className="space-y-2">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-white/5">
        {parts.map((p) => (
          <div
            key={p.key}
            style={{
              width: `${(p.value / total) * 100}%`,
              backgroundColor: p.color,
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {parts.map((p) => (
          <span
            key={p.key}
            className="flex items-center gap-1 text-[11px] text-text-muted"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            {p.key} {Math.round((p.value / total) * 100)}%
          </span>
        ))}
      </div>
    </div>
  );
}
