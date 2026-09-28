import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/common/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CNPX 컨픽스 — AI 콘텐츠 검증 · 연재 · IP화 플랫폼", template: "%s · CNPX" },
  description: "대중이 검증한 AI 웹툰과 AI 영화 티저. 신작 리그 → 정식 연재 → 영상화까지, 데이터로 증명하는 IP 파이프라인.",
  applicationName: "CNPX",
};

export const viewport: Viewport = {
  themeColor: "#0E0E0E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before paint: restores theme, resolves world for shared routes, skips splash if already shown.
const boot = `(function(){try{var d=document.documentElement;var t=JSON.parse(localStorage.getItem('cnpx-theme')||'{}');d.dataset.theme=(t.state&&t.state.theme)||'dark';var p=location.pathname;var w='webtoon';if(p.indexOf('/film')===0)w='film';else if(/^\\/(my|settings|search|notifications)/.test(p)){var s=JSON.parse(localStorage.getItem('cnpx-world')||'{}');w=(s.state&&s.state.world)||'webtoon';}d.dataset.world=w;if(sessionStorage.getItem('cnpx-splash'))d.classList.add('splashed');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="dark" data-world="webtoon" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
