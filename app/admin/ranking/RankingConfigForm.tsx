"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminRecomputeNow,
  adminUpdateRankingConfig,
} from "@/lib/actions/admin";

const FIELDS: [keyof State, string][] = [
  ["w_share", "공유 가중치"],
  ["w_save", "저장 가중치"],
  ["w_comment", "댓글 가중치"],
  ["w_like", "좋아요 가중치"],
  ["w_complete", "완주 가중치"],
  ["w_half", "절반시청 가중치"],
  ["half_life_hours", "반감기 (시간)"],
];

type State = {
  w_like: number;
  w_comment: number;
  w_share: number;
  w_save: number;
  w_complete: number;
  w_half: number;
  half_life_hours: number;
};

export function RankingConfigForm({ initial }: { initial: State }) {
  const [v, setV] = useState<State>(initial);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FIELDS.map(([key, label]) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-xs">{label}</Label>
            <Input
              type="number"
              step="0.5"
              value={v[key]}
              onChange={(e) =>
                setV((s) => ({ ...s, [key]: Number(e.target.value) }))
              }
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              await adminUpdateRankingConfig(v);
              toast.success("저장했어요. 다음 주기부터 반영됩니다.");
            })
          }
        >
          저장
        </Button>
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await adminRecomputeNow();
              toast.success(`재계산 완료 · ${r.ranked}개 작품`);
            })
          }
        >
          지금 재계산
        </Button>
      </div>
    </div>
  );
}
