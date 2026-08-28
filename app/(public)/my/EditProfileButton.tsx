"use client";

import { Pencil, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { editProfile } from "@/lib/actions/profile";

const avatarFor = (s: string) =>
  `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(s)}`;

export function EditProfileButton({
  nickname,
  bio,
  avatarUrl,
}: {
  nickname: string;
  bio: string;
  avatarUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [nn, setNn] = useState(nickname);
  const [bb, setBb] = useState(bio);
  const [av, setAv] = useState(avatarUrl || avatarFor(nickname));
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      try {
        await editProfile({ nickname: nn, bio: bb, avatarUrl: av });
        toast.success("프로필을 저장했어요.");
        setOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "저장 실패");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="secondary" size="sm">
            <Pencil className="h-3.5 w-3.5" /> 편집
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로필 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src={av}
              alt=""
              width={56}
              height={56}
              className="rounded-full bg-bg-elevated"
              unoptimized
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAv(avatarFor(Math.random().toString(36).slice(2)))}
            >
              <RefreshCw className="h-3.5 w-3.5" /> 아바타 변경
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label>닉네임</Label>
            <Input value={nn} maxLength={20} onChange={(e) => setNn(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>한 줄 소개</Label>
            <Textarea
              value={bb}
              maxLength={80}
              rows={2}
              onChange={(e) => setBb(e.target.value)}
            />
          </div>
          <Button className="w-full" disabled={pending} onClick={save}>
            {pending ? "저장 중…" : "저장"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
