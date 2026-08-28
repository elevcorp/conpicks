"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminUpdateTeaser } from "@/lib/actions/admin";
import type { TeaserStatus } from "@/lib/types";

const STATUSES: TeaserStatus[] = [
  "draft",
  "submitted",
  "in_review",
  "approved",
  "rejected",
  "hidden",
  "published",
];

export function TeaserAdminRow({
  id,
  status,
  jimovieUrl,
}: {
  id: string;
  status: TeaserStatus;
  jimovieUrl: string;
}) {
  const [st, setSt] = useState(status);
  const [url, setUrl] = useState(jimovieUrl);
  const [pending, start] = useTransition();

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <select
        value={st}
        onChange={(e) => {
          const next = e.target.value as TeaserStatus;
          setSt(next);
          start(async () => {
            await adminUpdateTeaser(id, { status: next });
            toast.success(`상태 → ${next}`);
          });
        }}
        className="rounded-md border border-border bg-bg-base px-2 py-1 text-xs"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="지무비 리뷰 YouTube URL"
        className="h-8 max-w-xs flex-1 text-xs"
      />
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await adminUpdateTeaser(id, {
              jimovie_review_url: url || null,
            });
            toast.success("리뷰 URL 저장");
          })
        }
      >
        저장
      </Button>
    </div>
  );
}
