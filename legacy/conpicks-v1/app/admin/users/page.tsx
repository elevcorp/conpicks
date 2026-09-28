import { listUsersAdmin } from "@/lib/data";
import { timeAgo } from "@/lib/format";
import { RoleToggle } from "./RoleToggle";
import { BanToggle } from "./BanToggle";

export const metadata = { title: "유저 관리" };

export default async function AdminUsersPage() {
  const users = await listUsersAdmin();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">유저 관리 ({users.length})</h1>
      <ul className="divide-y divide-border rounded-xl border border-border bg-bg-elevated">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-2 px-3 py-2.5">
            <span className="flex-1 text-sm font-medium">{u.nickname}</span>
            <span className="text-[11px] text-text-muted">
              가입 {timeAgo(u.created_at)}
            </span>
            <RoleToggle userId={u.id} current={u.role} />
            <BanToggle
              userId={u.id}
              banned={(u as unknown as { banned?: boolean }).banned ?? false}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
