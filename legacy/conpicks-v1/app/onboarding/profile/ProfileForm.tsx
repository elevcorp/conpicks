"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveProfileStep } from "@/lib/actions/auth";

const avatarFor = (seed: string) =>
  `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;

export function ProfileForm({
  defaultNickname,
  defaultAvatar,
}: {
  defaultNickname: string;
  defaultAvatar: string;
}) {
  const [nickname, setNickname] = useState(defaultNickname);
  const [bio, setBio] = useState("");
  const [avatarSeed, setAvatarSeed] = useState(defaultNickname || "conpicks");
  const [avatar, setAvatar] = useState(defaultAvatar || avatarFor(avatarSeed));
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function reroll() {
    const s = Math.random().toString(36).slice(2, 8);
    setAvatarSeed(s);
    setAvatar(avatarFor(s));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (nickname.trim().length < 2) {
      setErr("닉네임은 2자 이상이어야 합니다.");
      return;
    }
    setErr(null);
    start(() =>
      saveProfileStep({ nickname, avatarUrl: avatar, bio: bio || undefined }),
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center gap-4">
        <Image
          src={avatar}
          alt="아바타 미리보기"
          width={72}
          height={72}
          className="rounded-full border border-border bg-bg-elevated"
          unoptimized
        />
        <Button type="button" variant="secondary" size="sm" onClick={reroll}>
          <RefreshCw className="h-4 w-4" /> 다른 아바타
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nickname">닉네임</Label>
        <Input
          id="nickname"
          value={nickname}
          maxLength={20}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="공개적으로 표시될 이름"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">한 줄 소개 (선택)</Label>
        <Textarea
          id="bio"
          value={bio}
          maxLength={80}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
        />
      </div>

      {err && <p className="text-sm text-danger">{err}</p>}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "저장 중…" : "계속하기"}
      </Button>
    </form>
  );
}
