import { listUsersAdmin } from "@/lib/data";
import { RoleToggle } from "../users/RoleToggle";

export const metadata = { title: "심사위원 관리" };

export default async function AdminReviewersPage() {
  const users = await listUsersAdmin();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">심사위원 관리</h1>
      <p className="text-xs text-text-muted">
        지무비 / MCN 크리에이터를 심사위원으로 지정·해제합니다.
      </p>
      <ul className="divide-y divide-border rounded-xl border border-border bg-bg-elevated">
        {users.map((u) => (
          <li key={u.id} className="flex items-center gap-3 px-3 py-2.5">
            <span className="flex-1 text-sm">{u.nickname}</span>
            <span className="text-[11px] text-text-muted">{u.role}</span>
            <RoleToggle
              userId={u.id}
              current={u.role}
              options={["reviewer", u.role === "reviewer" ? "viewer" : u.role]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
