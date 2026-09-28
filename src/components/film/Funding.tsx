"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Clock, Check, HandCoins, Trophy, Sparkles, Film as FilmIcon, Clapperboard } from "lucide-react";
import { FilmCover } from "@/components/common/Covers";
import { Sheet } from "@/components/common/Sheet";
import { useUser } from "@/store/user";
import { demoToast } from "@/store/ui";
import { eok, won } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Film } from "@/lib/types";

export interface Campaign {
  id: string; filmId: string; title: string; subtitle: string; goal: number; raised: number; dday: number; backers: number;
  endDate: string; minAmount: number; partner: string; summary: string; notice: string;
  milestones: { label: string; date: string; done: boolean }[];
  tiers: { amount: number; label: string; perk: string }[];
}

/** Campaign numbers including what the viewer pledged this session. */
export function useLiveCampaign(c: Campaign) {
  const mine = useUser((s) => s.fundings);
  const raised = c.raised + mine.reduce((a, f) => a + f.amount, 0);
  return { raised, backers: c.backers + mine.length, percent: Math.floor((raised / c.goal) * 100), pledged: mine.length > 0 };
}

export function FundingProgress({ c, size = "md" }: { c: Campaign; size?: "md" | "lg" }) {
  const { raised, backers, percent } = useLiveCampaign(c);
  return (
    <div>
      <div className="flex items-end justify-between">
        <p className={cn("font-black text-[#7db3ff]", size === "lg" ? "text-[40px] leading-none" : "text-[26px] leading-none")}>
          {percent}%<span className="ml-1.5 text-[13px] font-semibold text-fg-2">달성</span>
        </p>
        <p className="text-right text-[13px] text-fg-2">
          <b className="text-[15px] text-white">{eok(raised)}</b> / 목표 {eok(c.goal)}
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#1b64da] via-brand to-[#7db3ff] shadow-[0_0_16px_rgba(49,130,246,0.7)]"
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.min(100, percent)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
      <div className="mt-3 flex gap-4 text-[13px] text-fg-2">
        <span className="flex items-center gap-1"><Clock size={14} /> <b className="text-white">D-{c.dday}</b></span>
        <span className="flex items-center gap-1"><Users size={14} /> <b className="text-white">{won(backers)}</b>명 참여</span>
      </div>
    </div>
  );
}

/** Compact card for the film home row. */
export function FundingCard({ c, film }: { c: Campaign; film: Film }) {
  return (
    <Link href="/film/funding" className="glass group grid overflow-hidden rounded-2xl transition hover:bg-white/10 md:grid-cols-[1.1fr_1fr]">
      <div className="relative aspect-video md:aspect-auto">
        <FilmCover film={film} className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 600px" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D1C] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0A0D1C]/60" />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[12px] font-bold text-white">
          <Trophy size={13} /> 시즌 1 우승작
        </span>
      </div>
      <div className="p-5 md:p-7">
        <p className="text-[12px] font-semibold text-[#7db3ff]">{c.subtitle}</p>
        <p className="mt-1 text-[20px] font-extrabold md:text-[24px]">{c.title}</p>
        <div className="mt-5">
          <FundingProgress c={c} />
        </div>
        <span className="mt-5 flex h-11 items-center justify-center rounded-xl bg-white text-[14px] font-bold text-[#0A0D1C]">펀딩 자세히 보기</span>
      </div>
    </Link>
  );
}

export function FundingPage({ c, film, upcoming }: { c: Campaign; film: Film; upcoming: { film: Film; opens: string; note: string }[] }) {
  const [open, setOpen] = useState(false);
  const { pledged } = useLiveCampaign(c);
  return (
    <div className="mx-auto max-w-[1080px] px-4 pb-16 md:px-6">
      <div className="hidden pb-6 pt-10 md:block">
        <h1 className="text-[30px] font-extrabold">펀딩</h1>
        <p className="mt-1.5 text-[15px] text-fg-2">대중이 검증한 우승작을, 대중이 함께 만듭니다</p>
      </div>

      <section className="glass overflow-hidden rounded-3xl">
        <div className="relative aspect-[16/9] md:aspect-[21/8]">
          <FilmCover film={film} portraitFit="blur" className="absolute inset-0" sizes="1080px" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1126] via-[#0d1126]/30 to-transparent" />
          {/* poster sits right, clear of the campaign title */}
          <div className="absolute inset-y-0 right-4 flex items-center md:right-10">
            <div className="relative aspect-[2/3] h-[84%] overflow-hidden rounded-xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/15">
              <FilmCover film={film} variant="poster" className="absolute inset-0" sizes="300px" priority />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 max-w-[62%] p-5 md:max-w-[70%] md:p-8">
            <span className="flex w-fit items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[12px] font-bold text-white">
              <Trophy size={13} /> {c.subtitle}
            </span>
            <h2 className="mt-2 font-serif text-[26px] font-black leading-tight md:text-[40px]">{c.title}</h2>
          </div>
        </div>
        <div className="grid gap-8 p-5 md:grid-cols-[1.2fr_1fr] md:p-8">
          <div>
            <FundingProgress c={c} size="lg" />
            <p className="mt-5 text-[14.5px] leading-relaxed text-fg-2">{c.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-[12.5px]">
              <span className="rounded-full bg-white/10 px-3 py-1.5">최소 {won(c.minAmount)}원</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">마감 {c.endDate}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">공동 제작 {c.partner}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpen(true)}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-[17px] font-bold text-white shadow-[0_10px_30px_rgba(49,130,246,0.45)]"
            >
              <HandCoins size={20} /> {pledged ? "추가로 참여하기" : "펀딩 참여하기"}
            </motion.button>
            <p className="mt-3 text-center text-[12.5px] text-fg-3">지분·IP 소유 없이 수익을 배분받는 참여형 제작</p>
          </div>
          <div>
            <h3 className="mb-3 text-[15px] font-bold">제작 로드맵</h3>
            <ol className="relative space-y-4 border-l border-white/15 pl-5">
              {c.milestones.map((m) => (
                <li key={m.label} className="relative">
                  <span className={cn("absolute -left-[27px] top-0.5 grid size-[14px] place-items-center rounded-full", m.done ? "bg-brand" : "border-2 border-white/30 bg-[#0d1126]")}>
                    {m.done && <Check size={9} strokeWidth={4} />}
                  </span>
                  <p className={cn("text-[14px] font-semibold", !m.done && "text-fg-2")}>{m.label}</p>
                  <p className="text-[12px] text-fg-3">{m.date}</p>
                </li>
              ))}
            </ol>
            <Link href={`/film/work/${film.id}`} className="mt-6 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-[13.5px] font-semibold ring-1 ring-white/10 hover:bg-white/10">
              <Clapperboard size={16} className="text-[#7db3ff]" /> 우승 티저 다시 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white/[0.03] p-5 text-[13px] leading-relaxed text-fg-2 ring-1 ring-white/10">
        <p className="mb-1 flex items-center gap-1.5 font-bold text-white"><Sparkles size={15} className="text-[#7db3ff]" /> 참여형 제작 안내</p>
        {c.notice}
      </section>

      <section className="mt-10">
        <h3 className="mb-3 text-[19px] font-extrabold">오픈 예정 펀딩</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {upcoming.map((u) => (
            <button key={u.film.id} onClick={() => demoToast(`'${u.film.title}' 오픈 알림을 신청했어요`)} className="glass group flex items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-white/10">
              <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg">
                <FilmCover film={u.film} className="absolute inset-0 transition-transform duration-500 group-hover:scale-110" sizes="128px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-[#7db3ff]">{u.opens} 오픈</p>
                <p className="truncate text-[15px] font-bold">{u.film.title}</p>
                <p className="truncate text-[12px] text-fg-3">{u.note}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-bold">알림</span>
            </button>
          ))}
        </div>
      </section>

      <PledgeSheet c={c} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function PledgeSheet({ c, open, onClose }: { c: Campaign; open: boolean; onClose: () => void }) {
  const [sel, setSel] = useState<number | "custom">(20000);
  const [custom, setCustom] = useState("");
  const fund = useUser((s) => s.fund);
  const amount = sel === "custom" ? Number(custom.replace(/[^0-9]/g, "")) : sel;
  const valid = amount >= c.minAmount;
  const perk = [...c.tiers].reverse().find((t) => amount >= t.amount)?.perk;

  const submit = () => {
    if (!valid) return;
    fund(amount);
    onClose();
    demoToast(`${won(amount)}원 펀딩 참여 완료 · 실제 결제 없음`);
  };

  return (
    <Sheet open={open} onClose={onClose} title="참여 금액 선택" film>
      <div className="grid grid-cols-2 gap-2">
        {c.tiers.map((t) => (
          <button key={t.amount} onClick={() => setSel(t.amount)} className={cn("h-14 rounded-2xl border text-[16px] font-bold transition-colors", sel === t.amount ? "border-brand bg-brand/20" : "border-white/15 hover:bg-white/5")}>
            {t.label}
          </button>
        ))}
        <button onClick={() => setSel("custom")} className={cn("h-14 rounded-2xl border text-[16px] font-bold transition-colors", sel === "custom" ? "border-brand bg-brand/20" : "border-white/15 hover:bg-white/5")}>
          직접입력
        </button>
      </div>
      {sel === "custom" && (
        <div className="mt-3 flex h-12 items-center rounded-xl bg-white/10 px-4">
          <input
            autoFocus
            inputMode="numeric"
            value={custom ? won(Number(custom.replace(/[^0-9]/g, ""))) : ""}
            onChange={(e) => setCustom(e.target.value)}
            placeholder={`${won(c.minAmount)}원 이상`}
            className="flex-1 bg-transparent text-[16px] font-bold outline-none placeholder:text-white/40"
            aria-label="참여 금액"
          />
          <span className="text-fg-2">원</span>
        </div>
      )}
      <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3.5 text-[13.5px]">
        <p className="flex items-center gap-1.5 font-semibold"><FilmIcon size={15} className="text-[#7db3ff]" /> 리워드</p>
        <p className="mt-1 text-fg-2">{perk ?? "최소 참여 금액은 1만원이에요"}</p>
      </div>
      <button disabled={!valid} onClick={submit} className="mt-5 h-[52px] w-full rounded-2xl bg-brand text-[16px] font-bold text-white transition disabled:opacity-40">
        {valid ? `${won(amount)}원 참여하기` : "금액을 선택하세요"}
      </button>
      <p className="mt-3 pb-2 text-center text-[12px] text-fg-3">시연 모드 · 실제 결제는 이루어지지 않습니다</p>
    </Sheet>
  );
}
