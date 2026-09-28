import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { WriteForm } from "./WriteForm";

export const metadata = { title: "글쓰기" };

export default async function WritePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/community/write");
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">글쓰기</h1>
      <WriteForm role={user.role} />
    </div>
  );
}
