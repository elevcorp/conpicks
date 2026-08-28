import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { supabaseEnabled, env } from "@/lib/env";
import { getMockLoginProfiles } from "@/lib/data";
import { MockLoginList } from "./MockLoginList";
import { OAuthButtons } from "./OAuthButtons";

export const metadata = { title: "로그인" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/" } = await searchParams;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Logo as="span" className="h-9" priority />
        <p className="mt-3 text-sm text-text-secondary">
          AI 영화를 발견하고, 흥행을 결정하세요.
        </p>
      </div>

      {supabaseEnabled ? (
        <OAuthButtons
          next={next}
          google={env.enableGoogleOAuth}
          kakao={env.enableKakaoOAuth}
        />
      ) : (
        <div className="space-y-3">
          <p className="rounded-lg border border-border bg-bg-elevated/60 p-3 text-xs text-text-muted">
            데모 모드입니다. 아래 시드 계정 중 하나로 바로 입장하세요. 실제
            이메일 / Google / Kakao 로그인은{" "}
            <code className="text-text-secondary">NEXT_PUBLIC_USE_SUPABASE=true</code>{" "}
            에서 활성화됩니다.
          </p>
          <MockLoginList profiles={await getMockLoginProfiles()} next={next} />
        </div>
      )}

      <p className="text-center text-xs text-text-muted">
        계속 진행하면 <Link href="#" className="underline">이용약관</Link> 및{" "}
        <Link href="#" className="underline">개인정보처리방침</Link>에 동의하게
        됩니다.
      </p>
    </div>
  );
}
