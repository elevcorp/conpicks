"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { signOut } from "@/lib/actions/auth";
import { switchToCreator } from "@/lib/actions/auth";
import { switchToViewer } from "@/lib/actions/profile";
import type { Role } from "@/lib/types";

export function SettingsPanel({ role }: { role: Role }) {
  const [notif, setNotif] = useState({ review: true, comment: true, rank: true, funding: true });
  const [pending, start] = useTransition();

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-text-secondary">알림</h2>
        {(
          [
            ["review", "심사 결과"],
            ["comment", "내 작품 댓글"],
            ["rank", "순위 변동 / Top 10 진입"],
            ["funding", "펀딩 소식"],
          ] as const
        ).map(([k, label]) => (
          <label
            key={k}
            className="flex items-center justify-between rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-sm"
          >
            {label}
            <Switch
              checked={notif[k]}
              onCheckedChange={(v) => setNotif((n) => ({ ...n, [k]: v === true }))}
            />
          </label>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-text-secondary">계정</h2>
        {role === "viewer" && (
          <button
            onClick={() =>
              start(async () => {
                await switchToCreator();
              })
            }
            className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-left text-sm"
          >
            🎬 창작자로 전환하기
          </button>
        )}
        {role === "creator" && (
          <button
            onClick={() =>
              start(async () => {
                try {
                  await switchToViewer();
                  toast.success("시청자로 전환했어요.");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "전환 실패");
                }
              })
            }
            className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-left text-sm"
          >
            시청자로 전환하기
          </button>
        )}
        <form action={signOut}>
          <button className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-left text-sm">
            로그아웃
          </button>
        </form>
        <button
          onClick={() => toast("탈퇴는 고객센터를 통해 처리돼요.")}
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-left text-sm text-danger"
        >
          회원 탈퇴
        </button>
      </section>

      <p className="text-center text-[11px] text-text-muted">
        {pending ? "처리 중…" : "CONPICKS · 데모 빌드"}
      </p>
    </div>
  );
}
