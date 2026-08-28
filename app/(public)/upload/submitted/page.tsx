import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "심사 중" };

export default function SubmittedPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 py-16 text-center">
      <span className="text-5xl">🎬</span>
      <h1 className="text-xl font-extrabold">제출이 완료됐어요</h1>
      <p className="text-sm text-text-secondary">
        지무비 + MCN 크리에이터가 1차 심사를 진행합니다. 예상 소요{" "}
        <b className="text-text-primary">약 48시간</b>. 결과는 알림으로
        보내드려요.
      </p>
      <div className="flex flex-col gap-2">
        <Link
          href="/my?tab=works"
          className={cn(buttonVariants({ size: "lg" }), "h-11")}
        >
          내 작품 보기
        </Link>
        <Link href="/" className="text-sm text-text-muted underline">
          홈으로
        </Link>
      </div>
    </div>
  );
}
