"use client";

import { useTransition } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { mockLogin } from "@/lib/actions/auth";
import type { Role } from "@/lib/types";

const ROLE_LABEL: Record<Role, string> = {
  admin: "운영자",
  reviewer: "심사위원",
  creator: "창작자",
  viewer: "시청자",
};

export function MockLoginList({
  profiles,
  next,
}: {
  profiles: {
    id: string;
    nickname: string;
    role: Role;
    avatar_url: string | null;
    onboarded: boolean;
  }[];
  next: string;
}) {
  const [pending, start] = useTransition();

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-bg-elevated">
      {profiles.map((p) => (
        <li key={p.id}>
          <button
            disabled={pending}
            onClick={() => start(() => mockLogin(p.id, next))}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={p.avatar_url ?? undefined} alt="" />
              <AvatarFallback>{p.nickname.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm font-medium">{p.nickname}</span>
            <Badge variant="outline" className="text-[10px]">
              {ROLE_LABEL[p.role]}
            </Badge>
            {!p.onboarded && (
              <span className="text-[10px] text-brand-accent">온보딩</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
