import { PageHeader } from "@/components/common/Nav";
import { SettingsPanel } from "@/components/common/SettingsPanel";

export const metadata = { title: "설정" };

export default function SettingsPage() {
  return (
    <main className="pb-16 md:pt-16">
      <PageHeader title="설정" back="/my" />
      <SettingsPanel />
    </main>
  );
}
