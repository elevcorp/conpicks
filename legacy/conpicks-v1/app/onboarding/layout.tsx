import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-dvh bg-aurora px-5 py-10">
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  );
}
