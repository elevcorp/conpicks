"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { adminSetRole } from "@/lib/actions/admin";
import type { Role } from "@/lib/types";

export function RoleToggle({
  userId,
  current,
  options = ["viewer", "creator", "reviewer", "admin"],
}: {
  userId: string;
  current: Role;
  options?: Role[];
}) {
  const [pending, start] = useTransition();
  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => {
        const role = e.target.value as Role;
        start(async () => {
          await adminSetRole(userId, role);
          toast.success(`역할 → ${role}`);
        });
      }}
      className="rounded-md border border-border bg-bg-base px-2 py-1 text-xs"
    >
      {Array.from(new Set([current, ...options])).map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
