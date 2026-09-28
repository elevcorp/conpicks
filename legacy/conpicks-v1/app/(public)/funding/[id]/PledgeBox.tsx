"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { krw } from "@/lib/format";
import { cn } from "@/lib/utils";

const TIERS = [10000, 20000, 50000];

export function PledgeBox({
  campaignId,
  min,
  loggedIn,
}: {
  campaignId: string;
  min: number;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(TIERS[0]);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);

  async function pledge() {
    if (!loggedIn) {
      toast.error("로그인이 필요합니다.", {
        action: { label: "로그인", onClick: () => router.push("/login") },
      });
      return;
    }
    const value = custom ? parseInt(custom, 10) : amount;
    if (!value || value < min) {
      toast.error(`최소 ${krw(min)}부터 참여할 수 있어요.`);
      return;
    }
    setBusy(true);
    const res = await fetch("/api/funding/pledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, amountKrw: value }),
    });
    setBusy(false);
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success("참여 신청 완료 — 입금 확인 후 확정됩니다.");
      router.refresh();
    } else {
      toast.error(j.error ?? "참여에 실패했어요.");
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-bg-elevated p-4">
      <div className="grid grid-cols-3 gap-2">
        {TIERS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setAmount(t);
              setCustom("");
            }}
            className={cn(
              "rounded-lg border py-2 text-sm font-semibold",
              !custom && amount === t
                ? "border-brand-gradient text-text-primary"
                : "border-border text-text-secondary",
            )}
          >
            {krw(t)}
          </button>
        ))}
      </div>
      <Input
        type="number"
        placeholder={`직접 입력 (최소 ${krw(min)})`}
        value={custom}
        min={min}
        onChange={(e) => setCustom(e.target.value)}
      />
      <Button className="w-full" size="lg" disabled={busy} onClick={pledge}>
        {busy ? "처리 중…" : "펀딩 참여하기"}
      </Button>
      <p className="text-[11px] text-text-muted">
        MVP 단계: 결제 연동 없이 관리자 입금 확인 후 확정됩니다. (2차에서 Toss
        Payments 연동)
      </p>
    </div>
  );
}
