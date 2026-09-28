"use client";
import { Sheet } from "./Sheet";
import { Logo } from "./Logo";
import { useUI } from "@/store/ui";
import { useUser } from "@/store/user";

/** One-tap mock login used anywhere a gated action is tapped. */
export function LoginSheet() {
  const { loginSheet, setLoginSheet, toast } = useUI();
  const login = useUser((s) => s.login);
  const go = () => {
    login();
    setLoginSheet(false);
    toast("시연계정으로 로그인했어요", "success");
  };
  return (
    <Sheet open={loginSheet} onClose={() => setLoginSheet(false)}>
      <div className="flex flex-col items-center pb-2 pt-6 text-center">
        <Logo size="lg" />
        <p className="mt-4 text-[17px] font-bold">로그인하고 모든 기능을 이용해 보세요</p>
        <p className="mt-1.5 text-[14px] text-fg-2">찜 · 댓글 · 미리보기 · 펀딩 참여</p>
        <button onClick={go} className="mt-6 h-[52px] w-full rounded-2xl bg-[#FEE500] text-[16px] font-bold text-[#191919]">
          카카오로 3초 만에 시작하기
        </button>
        <button onClick={go} className="mt-2 h-[52px] w-full rounded-2xl bg-chip text-[16px] font-bold">
          시연계정으로 바로 입장
        </button>
        <p className="mt-3 text-[12px] text-fg-3">시연 모드 · 실제 계정 연동 없이 로그인됩니다</p>
      </div>
    </Sheet>
  );
}

/** Returns a guard: runs `fn` if logged in, else opens the login sheet. */
export function useRequireLogin() {
  const loggedIn = useUser((s) => s.loggedIn);
  const open = useUI((s) => s.setLoginSheet);
  return (fn: () => void) => (loggedIn ? fn() : open(true));
}
