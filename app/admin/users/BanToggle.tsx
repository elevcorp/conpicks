"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { adminSetBanned } from "@/lib/actions/admin";

export function BanToggle({
  userId,
  banned,
}: {
  userId: string;
  banned: boolean;
}) {
  const [b, setB] = useState(banned);
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          await adminSetBanned(userId, !b);
          setB(!b);
          toast.success(!b ? "정지했어요" : "정지를 해제했어요");
        })
      }
      className={`rounded-md px-2 py-1 text-xs ${
        b ? "bg-danger/20 text-danger" : "bg-white/5 text-text-muted"
      }`}
    >
      {b ? "정지됨" : "정지"}
    </button>
  );
}
