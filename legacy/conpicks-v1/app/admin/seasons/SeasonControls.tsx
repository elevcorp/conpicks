"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  adminCreateSeason,
  adminSetSeasonStatus,
  adminSetWinner,
} from "@/lib/actions/admin";

export function SeasonControls({
  seasonId,
  status,
  top,
  winnerId,
}: {
  seasonId: string;
  status: "draft" | "active" | "closed";
  top: { id: string; title: string; rank: number }[];
  winnerId: string | null;
}) {
  const [pending, start] = useTransition();
  const [winner, setWinner] = useState(winnerId ?? "");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "active" && status !== "closed" && (
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await adminSetSeasonStatus(seasonId, "active");
              toast.success("시즌을 활성화했어요.");
            })
          }
        >
          활성화
        </Button>
      )}
      {status === "active" && (
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await adminSetSeasonStatus(seasonId, "closed");
              toast.success("시즌 종료 · 최종 랭킹 스냅샷 확정 · 1위 우승작 지정");
            })
          }
        >
          시즌 종료 (스냅샷 확정)
        </Button>
      )}
      {top.length > 0 && (
        <div className="flex items-center gap-1.5">
          <select
            value={winner}
            onChange={(e) => setWinner(e.target.value)}
            className="rounded-md border border-border bg-bg-base px-2 py-1 text-xs"
          >
            <option value="">우승작 지정…</option>
            {top.map((t) => (
              <option key={t.id} value={t.id}>
                {t.rank}위 · {t.title}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="secondary"
            disabled={pending || !winner}
            onClick={() =>
              start(async () => {
                await adminSetWinner(seasonId, winner);
                toast.success("우승작을 지정했어요.");
              })
            }
          >
            지정
          </Button>
        </div>
      )}
    </div>
  );
}

export function SeasonCreate() {
  const [f, setF] = useState({
    name: "",
    startsAt: "",
    endsAt: "",
    prizeKrw: 30000000,
    rulesMd: "",
  });
  const [pending, start] = useTransition();

  return (
    <div className="space-y-2">
      {(
        [
          ["name", "이름", "text"],
          ["startsAt", "시작일", "date"],
          ["endsAt", "종료일", "date"],
          ["prizeKrw", "상금(원)", "number"],
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
        placeholder="규정 (마크다운)"
        value={f.rulesMd}
        onChange={(e) => setF((s) => ({ ...s, rulesMd: e.target.value }))}
      />
      <Button
        disabled={pending || !f.name || !f.startsAt || !f.endsAt}
        onClick={() =>
          start(async () => {
            await adminCreateSeason({
              name: f.name,
              startsAt: new Date(f.startsAt).toISOString(),
              endsAt: new Date(f.endsAt).toISOString(),
              prizeKrw: f.prizeKrw,
              rulesMd: f.rulesMd,
            });
            toast.success("시즌을 만들었어요 (draft).");
            setF({ name: "", startsAt: "", endsAt: "", prizeKrw: 30000000, rulesMd: "" });
          })
        }
      >
        만들기
      </Button>
    </div>
  );
}
