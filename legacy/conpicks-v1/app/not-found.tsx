import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-aurora px-6 text-center">
      <div className="space-y-4">
        <Logo as="span" className="h-8" />
        <p className="text-lg font-bold">페이지를 찾을 수 없어요</p>
        <p className="text-sm text-text-muted">
          주소가 바뀌었거나 삭제된 작품일 수 있어요.
        </p>
        <Link
          href="/"
          className="bg-brand-gradient inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
        >
          홈으로 가기
        </Link>
      </div>
    </div>
  );
}
