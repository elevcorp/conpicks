import { handler, ok, requireUserApi } from "@/lib/api";
import { getNotifications, markNotificationsRead } from "@/lib/data";

export const GET = handler(async () => {
  const user = await requireUserApi();
  const items = await getNotifications(user.id);
  return ok({
    items,
    unread: items.filter((n) => !n.read_at).length,
  });
});

export const POST = handler(async () => {
  const user = await requireUserApi();
  await markNotificationsRead(user.id);
  return ok({ ok: true });
});
