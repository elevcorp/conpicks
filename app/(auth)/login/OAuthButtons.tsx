"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";

export function OAuthButtons({
  next,
  google,
  kakao,
}: {
  next: string;
  google: boolean;
  kakao: boolean;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const redirectTo = `${env.siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

  async function oauth(provider: "google" | "kakao") {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  }

  async function magic(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setBusy(false);
    if (!error) setSent(true);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {google && (
          <Button
            variant="secondary"
            className="w-full"
            disabled={busy}
            onClick={() => oauth("google")}
          >
            Google로 계속하기
          </Button>
        )}
        {kakao && (
          <Button
            variant="secondary"
            className="w-full"
            disabled={busy}
            onClick={() => oauth("kakao")}
          >
            Kakao로 계속하기
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 text-[11px] text-text-muted">
        <span className="h-px flex-1 bg-border" /> 또는 이메일{" "}
        <span className="h-px flex-1 bg-border" />
      </div>

      {sent ? (
        <p className="rounded-lg border border-border bg-bg-elevated p-3 text-sm text-text-secondary">
          {email}로 로그인 링크를 보냈습니다. 메일함을 확인하세요.
        </p>
      ) : (
        <form onSubmit={magic} className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Button type="submit" className="w-full" disabled={busy}>
            로그인 링크 받기
          </Button>
        </form>
      )}
    </div>
  );
}
