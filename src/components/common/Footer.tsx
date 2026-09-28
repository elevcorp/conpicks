import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-[1200px] border-t border-line px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-8 text-[12px] leading-relaxed text-fg-3 md:px-6 md:pb-12">
      <Logo size="sm" className="text-fg-2" />
      <p className="mt-3">AI 콘텐츠의 검증 · 연재 · IP화 플랫폼</p>
      <p className="mt-2">
        이용약관 · <b className="text-fg-2">개인정보처리방침</b> · 청소년보호정책 · 창작자 센터 · 고객센터
      </p>
      <p className="mt-2">(주)컨픽스 · 시연용 목업입니다. 표시된 작품·수치·결제는 모두 가상 데이터입니다.</p>
      <p className="mt-1">© 2026 CNPX. All rights reserved.</p>
    </footer>
  );
}
