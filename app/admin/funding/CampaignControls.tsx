"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  adminCreateCampaign,
  adminSetCampaignStatus,
} from "@/lib/actions/admin";
import type { FundingStatus } from "@/lib/types";

const FLOW: FundingStatus[] = [
  "draft",
  "open",
  "success",
  "failed",
  "settling",
  "closed",
];

export function CampaignControls({
  id,
  status,
}: {
  id: string;
  status: FundingStatus;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap gap-1.5">
      {FLOW.map((s) => (
        <button
          key={s}
          disabled={pending || s === status}
          onClick={() =>
            start(async () => {
              await adminSetCampaignStatus(id, s);
              toast.success(`상태 → ${s}`);
            })
          }
          className={`rounded-md px-2 py-1 text-xs ${
            s === status
              ? "bg-brand-to text-white"
              : "bg-white/5 text-text-muted"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export function CampaignCreate({
  teasers,
}: {
  teasers: { id: string; title: string; rank: number }[];
}) {
  const [f, setF] = useState({
    teaserId: teasers[0]?.id ?? "",
    type: "revenue_share" as "reward" | "revenue_share",
    goalKrw: 20000000,
    startsAt: "",
    endsAt: "",
    termsMd:
      "수익배분형 캠페인. 참여자는 지분·IP 권리가 없으며, 발생 순수익의 20%를 참여금 비례로 분배합니다.",
  });
  const [pending, start] = useTransition();

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs">대상 작품</Label>
        <select
          value={f.teaserId}
          onChange={(e) => setF((s) => ({ ...s, teaserId: e.target.value }))}
          className="w-full rounded-md border border-border bg-bg-base px-2 py-1.5 text-sm"
        >
          {teasers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.rank > 0 ? `${t.rank}위 · ` : ""}
              {t.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">유형</Label>
        <select
          value={f.type}
          onChange={(e) =>
            setF((s) => ({
              ...s,
              type: e.target.value as "reward" | "revenue_share",
            }))
          }
          className="w-full rounded-md border border-border bg-bg-base px-2 py-1.5 text-sm"
        >
          <option value="revenue_share">수익배분형</option>
          <option value="reward">리워드형</option>
        </select>
      </div>
      {(
        [
          ["goalKrw", "목표액(원)", "number"],
          ["startsAt", "시작일", "date"],
          ["endsAt", "종료일", "date"],
        ] as const
      ).map(([k, label, type]) => (
        <div key={k} className="space-y-1">
          <Label className="text-xs">{label}</Label>
          <Input
            type={type}
            value={f[k] as string | number}
            onChange={(e) =>
              setF((s) => ({
                ...s,
                [k]: type === "number" ? Number(e.target.value) : e.target.value,
              }))
            }
          />
        </div>
      ))}
      <Textarea
        rows={3}
        value={f.termsMd}
        onChange={(e) => setF((s) => ({ ...s, termsMd: e.target.value }))}
      />
      <Button
        disabled={pending || !f.teaserId || !f.startsAt || !f.endsAt}
        onClick={() =>
          start(async () => {
            await adminCreateCampaign({
              teaserId: f.teaserId,
              type: f.type,
              goalKrw: f.goalKrw,
              startsAt: new Date(f.startsAt).toISOString(),
              endsAt: new Date(f.endsAt).toISOString(),
              termsMd: f.termsMd,
            });
            toast.success("캠페인을 만들었어요 (draft).");
          })
        }
      >
        만들기
      </Button>
    </div>
  );
}
