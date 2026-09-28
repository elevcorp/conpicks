"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Coins, Receipt, Ticket, Gift, Megaphone, ChevronRight, Heart, MessageCircle, HandCoins, Settings, Bell, Palette, Headphones, LogOut,
} from "lucide-react";
import { Sheet } from "./Sheet";
import { EmptyState } from "./EmptyState";
import { useCurrentWorld } from "./useCurrentWorld";
import { useUser } from "@/store/user";
import { useUI, demoToast } from "@/store/ui";
import { webtoons } from "@/lib/catalog";
import { won } from "@/lib/format";
import { cn } from "@/lib/cn";

const titleOf = new Map(webtoons.map((w) => [w.id, w.title]));

export function MyPage() {
  const world = useCurrentWorld();
  const u = useUser();
  const { setCashSheet, setLoginSheet, toast } = useUI();
  const [sheet, setSheet] = useState<null | "cash" | "ticket" | "coupon" | "notice" | "comments">(null);
  const [coupon, setCoupon] = useState("");
  const film = world === "film";

  const likes = u.liked.length + u.epLikes.length + u.filmLiked.length;
  const tickets = Object.entries(u.rentalTickets).filter(([, n]) => n > 0);

  return (
    <div className="mx-auto max-w-[760px] px-4 pb-10 md:px-6">
      {/* profile */}
      <section className="flex items-center gap-4 py-6">
        <div className={cn("grid size-16 place-items-center rounded-full text-[24px] font-black text-white", u.loggedIn ? "bg-gradient-to-br from-brand to-[#7a5cff]" : "bg-chip text-fg-3")}>
          {u.loggedIn ? "시" : "?"}
        </div>
        <div className="flex-1">
          {u.loggedIn ? (
            <>
              <p className="text-[20px] font-extrabold">{u.nickname}</p>
              <p className="mt-0.5 text-[13px] text-fg-3">독자 · 2026.09 가입 · {film ? "AI 영화 월드" : "AI 웹툰 월드"}</p>
            </>
          ) : (
            <button onClick={() => setLoginSheet(true)} className="text-left">
              <p className="flex items-center gap-1 text-[20px] font-extrabold">로그인해 주세요 <ChevronRight size={20} /></p>
              <p className="mt-0.5 text-[13px] text-fg-3">3초 만에 시작하고 캐시 1,000을 받아가세요</p>
            </button>
          )}
        </div>
      </section>

      {/* cash */}
      <section className={cn("rounded-3xl p-5", film ? "glass" : "bg-elev")}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-fg-2">보유 캐시</p>
            <motion.p key={u.cash} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 flex items-center gap-1.5 text-[28px] font-black">
              <Coins size={22} className="text-free" />
              {won(u.cash)}
            </motion.p>
          </div>
          <button onClick={() => setCashSheet(true)} className="h-11 rounded-full bg-brand px-5 text-[14px] font-bold text-white">
            캐시 충전
          </button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { k: "cash" as const, icon: Receipt, label: "캐시 내역" },
            { k: "ticket" as const, icon: Ticket, label: "이용권 내역" },
            { k: "coupon" as const, icon: Gift, label: "쿠폰 등록" },
          ].map(({ k, icon: I, label }) => (
            <button key={k} onClick={() => setSheet(k)} className="flex flex-col items-center gap-1.5 rounded-2xl bg-chip py-3.5 text-[13px] font-semibold transition hover:brightness-110">
              <I size={20} className="text-fg-2" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* notice */}
      <button onClick={() => setSheet("notice")} className="mt-3 flex w-full items-center gap-2 rounded-2xl bg-chip px-4 py-3.5 text-left text-[14px]">
        <Megaphone size={17} className="shrink-0 text-brand" />
        <span className="flex-1 truncate font-semibold">2026년 12월 CNPX 정식 오픈 안내</span>
        <ChevronRight size={17} className="text-fg-3" />
      </button>

      {/* activity */}
      <section className="mt-8">
        <h2 className="mb-3 text-[17px] font-bold">내 활동</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Heart, label: "좋아요", v: likes, href: "/library?tab=liked" },
            { icon: MessageCircle, label: "댓글", v: u.myComments.length, on: () => setSheet("comments") },
            { icon: HandCoins, label: "펀딩", v: u.fundings.length, href: "/film/funding" },
          ].map(({ icon: I, label, v, href, on }) => {
            const inner = (
              <>
                <I size={20} className="text-fg-2" />
                <span className="text-[22px] font-black">{v}</span>
                <span className="text-[12px] text-fg-3">{label}</span>
              </>
            );
            const cls = cn("flex flex-col items-center gap-0.5 rounded-2xl py-4", film ? "glass" : "bg-elev");
            return href ? <Link key={label} href={href} className={cls}>{inner}</Link> : <button key={label} onClick={on} className={cls}>{inner}</button>;
          })}
        </div>
      </section>

      {/* menu */}
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {[
          { icon: Settings, label: "설정", href: "/settings" },
          { icon: Palette, label: "화면 스타일 (다크 / 라이트)", href: "/settings" },
          { icon: Bell, label: "알림", href: "/notifications" },
          { icon: Headphones, label: "고객센터", on: () => demoToast("고객센터는 정식 오픈 시 연결돼요") },
        ].map(({ icon: I, label, href, on }) => {
          const inner = (
            <>
              <I size={19} className="text-fg-2" />
              <span className="flex-1 text-[15px] font-semibold">{label}</span>
              <ChevronRight size={18} className="text-fg-3" />
            </>
          );
          return (
            <li key={label}>
              {href ? <Link href={href} className="flex h-14 items-center gap-3">{inner}</Link> : <button onClick={on} className="flex h-14 w-full items-center gap-3 text-left">{inner}</button>}
            </li>
          );
        })}
        {u.loggedIn && (
          <li>
            <button onClick={() => { u.logout(); toast("로그아웃했어요"); }} className="flex h-14 w-full items-center gap-3 text-left text-fg-3">
              <LogOut size={19} />
              <span className="text-[15px] font-semibold">로그아웃</span>
            </button>
          </li>
        )}
      </ul>
      <p className="mt-6 text-center text-[12px] text-fg-3">CNPX 시연 버전 1.0.0 · 모든 데이터는 가상입니다</p>

      {/* sheets */}
      <Sheet open={sheet === "cash"} onClose={() => setSheet(null)} title="캐시 내역">
        <ul className="pb-2">
          {u.cashLog.map((l) => (
            <li key={l.id} className="flex items-center justify-between border-b border-line py-3.5">
              <div>
                <p className="text-[15px] font-semibold">{l.label}</p>
                <p className="text-[12px] text-fg-3">{l.at}</p>
              </div>
              <span className={cn("text-[15px] font-bold", l.amount > 0 ? "text-brand" : "text-fg")}>
                {l.amount > 0 ? "+" : ""}{won(l.amount)}
              </span>
            </li>
          ))}
        </ul>
      </Sheet>
      <Sheet open={sheet === "ticket"} onClose={() => setSheet(null)} title="이용권 내역">
        {tickets.length ? (
          <ul className="pb-2">
            {tickets.map(([id, n]) => (
              <li key={id} className="flex items-center justify-between border-b border-line py-3.5">
                <Link href={`/work/${id}?tab=ticket`} className="text-[15px] font-semibold" onClick={() => setSheet(null)}>{titleOf.get(id)}</Link>
                <span className="text-[14px] font-bold">대여권 {n}장</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<Ticket size={24} />} title="보유한 이용권이 없어요" desc="작품홈 › 이용권 탭에서 구매할 수 있어요" className="py-10" />
        )}
      </Sheet>
      <Sheet open={sheet === "coupon"} onClose={() => setSheet(null)} title="쿠폰 등록">
        <p className="-mt-1 text-[13px] text-fg-3">시연용 쿠폰 코드: <b className="text-fg">CNPX2026</b></p>
        <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="쿠폰 코드를 입력하세요" className="mt-4 h-12 w-full rounded-xl bg-chip px-4 text-[15px] font-semibold tracking-wider outline-none ring-brand focus:ring-2" aria-label="쿠폰 코드" />
        <button
          onClick={() => {
            if (coupon.trim() === "CNPX2026") {
              u.charge(500, "쿠폰 CNPX2026");
              setSheet(null);
              setCoupon("");
              toast("쿠폰 등록 완료 · 캐시 500이 지급되었어요", "success");
            } else toast("유효하지 않은 쿠폰이에요 (시연 코드: CNPX2026)");
          }}
          className="mb-2 mt-3 h-[52px] w-full rounded-2xl bg-brand text-[16px] font-bold text-white"
        >
          등록하기
        </button>
      </Sheet>
      <Sheet open={sheet === "notice"} onClose={() => setSheet(null)} title="공지사항">
        <p className="text-[16px] font-bold">2026년 12월 CNPX 정식 오픈 안내</p>
        <p className="mt-1 text-[12px] text-fg-3">2026.09.23 · CNPX 운영팀</p>
        <div className="mt-4 space-y-3 pb-3 text-[14px] leading-relaxed text-fg-2">
          <p>안녕하세요, CNPX입니다. AI 콘텐츠의 검증 · 연재 · IP화 플랫폼 CNPX가 2026년 12월 정식 오픈합니다.</p>
          <p>• AI 웹툰 월드: 신작 리그 → 정식 연재 승격 → 실시간 랭킹<br />• AI 영화 월드: 2~3분 티저 컨테스트 → 대중 검증 → 우승작 제작 펀딩</p>
          <p>현재 버전은 투자·파트너 시연용으로, 결제·업로드·로그인은 실제로 처리되지 않습니다.</p>
        </div>
      </Sheet>
      <Sheet open={sheet === "comments"} onClose={() => setSheet(null)} title="내가 쓴 댓글">
        {u.myComments.length ? (
          <ul className="pb-2">
            {u.myComments.map((c) => (
              <li key={c.id} className="border-b border-line py-3.5">
                <p className="text-[12px] text-fg-3">{titleOf.get(c.workId)} · {c.episode}</p>
                <p className="mt-0.5 text-[15px]">{c.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<MessageCircle size={24} />} title="아직 쓴 댓글이 없어요" desc="작품홈 › 댓글 탭에서 첫 댓글을 남겨보세요" className="py-10" />
        )}
      </Sheet>
    </div>
  );
}
