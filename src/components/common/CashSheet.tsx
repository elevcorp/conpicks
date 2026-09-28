"use client";
import { useState } from "react";
import { Coins, Check } from "lucide-react";
import { Sheet } from "./Sheet";
import { useUI, demoToast } from "@/store/ui";
import { useUser } from "@/store/user";
import { cn } from "@/lib/cn";
import { won } from "@/lib/format";

const PRODUCTS = [
  { cash: 1000, bonus: 0, price: 1000 },
  { cash: 3000, bonus: 300, price: 3000, tag: "인기" },
  { cash: 10000, bonus: 1500, price: 10000, tag: "보너스 15%" },
];

/** Global cash top-up sheet (mock payment). */
export function CashSheet() {
  const { cashSheet, setCashSheet } = useUI();
  const { cash, charge } = useUser();
  const [sel, setSel] = useState(1);
  const close = () => setCashSheet(false);
  const buy = () => {
    const p = PRODUCTS[sel];
    charge(p.cash + p.bonus, `캐시 충전 ${won(p.cash)}${p.bonus ? ` +${won(p.bonus)}` : ""}`);
    close();
    demoToast(`${won(p.cash + p.bonus)} 캐시가 충전되었어요 (실제 결제 없음)`);
  };
  return (
    <Sheet open={cashSheet} onClose={close} title="캐시 충전">
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-chip px-4 py-3.5">
        <span className="text-[14px] text-fg-2">보유 캐시</span>
        <span className="flex items-center gap-1.5 text-[18px] font-extrabold">
          <Coins size={18} className="text-free" />
          {won(cash)}
        </span>
      </div>
      <ul className="space-y-2">
        {PRODUCTS.map((p, i) => (
          <li key={p.cash}>
            <button
              onClick={() => setSel(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-colors",
                sel === i ? "border-brand bg-brand-soft" : "border-line hover:bg-chip",
              )}
            >
              <span className={cn("grid size-5 place-items-center rounded-full border", sel === i ? "border-brand bg-brand text-white" : "border-fg-3")}>
                {sel === i && <Check size={13} strokeWidth={3} />}
              </span>
              <span className="flex-1">
                <span className="text-[16px] font-bold">{won(p.cash)} 캐시</span>
                {p.bonus > 0 && <span className="ml-1.5 text-[13px] font-bold text-brand">+{won(p.bonus)}</span>}
                {p.tag && <span className="ml-2 rounded bg-up/15 px-1.5 py-0.5 text-[11px] font-bold text-up">{p.tag}</span>}
              </span>
              <span className="text-[15px] font-semibold">₩{won(p.price)}</span>
            </button>
          </li>
        ))}
      </ul>
      <button onClick={buy} className="mt-5 h-[52px] w-full rounded-2xl bg-brand text-[16px] font-bold text-white transition active:scale-[0.99]">
        ₩{won(PRODUCTS[sel].price)} 결제하기
      </button>
      <p className="mt-3 pb-2 text-center text-[12px] text-fg-3">시연 모드 · 실제 결제는 이루어지지 않습니다</p>
    </Sheet>
  );
}
