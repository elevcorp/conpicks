"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminAddRevenue,
  adminGeneratePayouts,
  adminMarkPaid,
} from "@/lib/actions/admin";
import { krw } from "@/lib/format";

interface Row {
  id: string;
  user_id: string;
  amount_krw: number;
  status: string;
}

export function SettlementPanel({
  campaignId,
  title,
  teaserId,
  revenue,
  pledges,
  payouts,
}: {
  campaignId: string;
  title: string;
  teaserId: string;
  revenue: { id: string; source: string; amount_krw: number }[];
  pledges: Row[];
  payouts: Row[];
}) {
  const [pending, start] = useTransition();
  const [src, setSrc] = useState("");
  const [amt, setAmt] = useState<number>(0);
  const [pct, setPct] = useState<number>(20);

  const totalRevenue = revenue.reduce((s, r) => s + r.amount_krw, 0);
  const totalPledged = pledges.reduce((s, p) => s + p.amount_krw, 0);

  function exportCsv() {
    const lines = [
      "user_id,pledge_krw,payout_krw,status",
      ...payouts.map((po) => {
        const pl = pledges.find((p) => p.user_id === po.user_id);
        return `${po.user_id},${pl?.amount_krw ?? 0},${po.amount_krw},${po.status}`;
      }),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payouts_${campaignId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-3 rounded-xl border border-border bg-bg-elevated p-4">
      <h2 className="text-sm font-bold">{title}</h2>

      <div className="space-y-1 text-xs text-text-muted">
        <p>총 참여금 {krw(totalPledged)} · 총 수익 {krw(totalRevenue)}</p>
        <ul className="space-y-0.5">
          {revenue.map((r) => (
            <li key={r.id}>
              · {r.source} — {krw(r.amount_krw)}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <Input
          placeholder="수익 항목"
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          className="h-8 w-40 text-xs"
        />
        <Input
          type="number"
          placeholder="금액"
          value={amt || ""}
          onChange={(e) => setAmt(Number(e.target.value))}
          className="h-8 w-28 text-xs"
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={pending || !src || !amt}
          onClick={() =>
            start(async () => {
              await adminAddRevenue({
                teaserId,
                source: src,
                amountKrw: amt,
              });
              setSrc("");
              setAmt(0);
              toast.success("수익 입력됨");
            })
          }
        >
          수익 추가
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-text-muted">
          배분 비율(%)
          <Input
            type="number"
            value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
            className="mt-1 h-8 w-20 text-xs"
          />
        </label>
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await adminGeneratePayouts(campaignId, pct);
              toast.success(`배분 계산 완료 · 풀 ${krw(r.pool)} · ${r.count}명`);
            })
          }
        >
          배분액 계산
        </Button>
        <Button size="sm" variant="secondary" onClick={exportCsv}>
          CSV 내보내기
        </Button>
      </div>

      {payouts.length > 0 && (
        <table className="w-full text-xs">
          <thead className="text-text-muted">
            <tr>
              <th className="text-left">참여자</th>
              <th className="text-right">배분액</th>
              <th className="text-right">상태</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="py-1">{p.user_id}</td>
                <td className="text-right">{krw(p.amount_krw)}</td>
                <td className="text-right">
                  {p.status === "paid" ? (
                    <span className="text-success">지급 완료</span>
                  ) : (
                    <button
                      className="text-brand-accent underline"
                      onClick={() =>
                        start(async () => {
                          await adminMarkPaid(p.id);
                          toast.success("지급 완료 처리");
                        })
                      }
                    >
                      지급 처리
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
