import Link from "next/link";
import { Logo } from "@/components/common/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo size="lg" />
      <p className="mt-6 text-[20px] font-bold">찾으시는 페이지가 없어요</p>
      <p className="mt-2 text-[14px] text-fg-3">주소가 바뀌었거나 연재가 종료된 작품일 수 있어요.</p>
      <div className="mt-6 flex gap-2">
        <Link href="/" className="rounded-full bg-brand px-5 py-3 text-[15px] font-bold text-white">웹툰 홈</Link>
        <Link href="/film" className="rounded-full bg-chip px-5 py-3 text-[15px] font-bold">영화 홈</Link>
      </div>
    </main>
  );
}
