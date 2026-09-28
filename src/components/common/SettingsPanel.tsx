"use client";
import { motion } from "framer-motion";
import { Moon, Sun, Check, RotateCcw } from "lucide-react";
import { useTheme } from "@/store/theme";
import { usePrefs } from "@/store/prefs";
import { useUser } from "@/store/user";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/cn";
import type { ThemeMode } from "@/lib/types";

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const { scroll, setScroll, notify, setNotify } = usePrefs();
  const toast = useUI((s) => s.toast);

  const resetDemo = () => {
    useUser.setState(useUser.getInitialState());
    toast("시연 데이터를 초기화했어요 · 캐시 1,000", "success");
  };

  return (
    <div className="mx-auto max-w-[640px] px-4 md:px-6">
      <h1 className="hidden pb-4 pt-10 text-[30px] font-extrabold md:block">설정</h1>

      <Section title="화면 스타일">
        <div className="grid grid-cols-2 gap-3">
          {([
            { k: "dark", label: "다크 모드", icon: Moon, preview: "bg-[#0E0E0E]", bar: "bg-[#262626]" },
            { k: "light", label: "라이트 모드", icon: Sun, preview: "bg-white", bar: "bg-[#E5E8EB]" },
          ] as { k: ThemeMode; label: string; icon: typeof Moon; preview: string; bar: string }[]).map(({ k, label, icon: I, preview, bar }) => {
            const active = theme === k;
            return (
              <button key={k} onClick={() => setTheme(k)} className={cn("relative rounded-2xl border-2 p-3 text-left transition-colors", active ? "border-brand" : "border-line")}>
                <div className={cn("flex h-24 flex-col gap-1.5 rounded-xl p-3 ring-1 ring-black/10", preview)}>
                  <I size={22} className={k === "dark" ? "text-[#FFD54F]" : "text-[#FF9F0A]"} />
                  <span className={cn("mt-auto h-2 w-3/4 rounded", bar)} />
                  <span className={cn("h-2 w-1/2 rounded", bar)} />
                </div>
                <p className="mt-2.5 flex items-center justify-between text-[15px] font-bold">
                  {label}
                  <span className={cn("grid size-5 place-items-center rounded-full border", active ? "border-brand bg-brand text-white" : "border-fg-3")}>
                    {active && <Check size={12} strokeWidth={3} />}
                  </span>
                </p>
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 text-[12.5px] text-fg-3">AI 영화 월드는 시네마틱 경험을 위해 항상 다크로 표시돼요.</p>
      </Section>

      <Section title="작품 감상 설정">
        <p className="mb-2 text-[14px] text-fg-2">스크롤 방향</p>
        <div className="flex rounded-xl bg-chip p-1">
          {([
            ["vertical", "세로 스크롤"],
            ["page", "페이지 넘김"],
          ] as const).map(([k, l]) => (
            <button key={k} onClick={() => setScroll(k)} className={cn("relative h-10 flex-1 rounded-lg text-[14px] font-semibold", scroll === k ? "text-fg" : "text-fg-3")}>
              {scroll === k && <motion.span layoutId="scroll-pref" className="absolute inset-0 rounded-lg bg-elev-2 shadow" />}
              <span className="relative">{l}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="알림">
        {([
          ["update", "관심 작품 업데이트"],
          ["rank", "랭킹 · 승격 소식"],
          ["funding", "펀딩 진행 상황"],
          ["marketing", "이벤트 · 혜택 (선택)"],
        ] as const).map(([k, l]) => (
          <label key={k} className="flex h-14 cursor-pointer items-center justify-between border-b border-line text-[15px] font-semibold last:border-none">
            {l}
            <Toggle on={notify[k]} onChange={(v) => setNotify(k, v)} />
          </label>
        ))}
      </Section>

      <Section title="시연">
        <button onClick={resetDemo} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-chip text-[14px] font-semibold">
          <RotateCcw size={16} /> 시연 데이터 초기화 (캐시 · 찜 · 구매)
        </button>
        <p className="mt-4 text-center text-[12px] text-fg-3">CNPX 시연 버전 1.0.0</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-6 last:border-none">
      <h2 className="mb-4 text-[17px] font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className={cn("relative h-[30px] w-[52px] rounded-full transition-colors", on ? "bg-brand" : "bg-fg-3/40")}>
      <motion.span layout className={cn("absolute top-[3px] size-6 rounded-full bg-white shadow", on ? "right-[3px]" : "left-[3px]")} transition={{ type: "spring", stiffness: 600, damping: 32 }} />
    </button>
  );
}
