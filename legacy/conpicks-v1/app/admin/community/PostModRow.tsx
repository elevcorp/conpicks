"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { adminSetPostFlags } from "@/lib/actions/admin";

export function PostModRow({
  id,
  hidden,
  pinned,
}: {
  id: string;
  hidden: boolean;
  pinned: boolean;
}) {
  const [h, setH] = useState(hidden);
  const [p, setP] = useState(pinned);
  const [pending, start] = useTransition();

  return (
    <div className="mt-2 flex gap-2">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            await adminSetPostFlags(id, { is_hidden: !h });
            setH(!h);
            toast.success(!h ? "숨김" : "숨김 해제");
          })
        }
        className="rounded-md bg-white/5 px-2 py-1 text-xs text-text-secondary"
      >
        {h ? "숨김 해제" : "숨기기"}
      </button>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            await adminSetPostFlags(id, { is_pinned: !p });
            setP(!p);
            toast.success(!p ? "고정" : "고정 해제");
          })
        }
        className="rounded-md bg-white/5 px-2 py-1 text-xs text-text-secondary"
      >
        {p ? "고정 해제" : "고정"}
      </button>
    </div>
  );
}
