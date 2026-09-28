import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CONPICKS — AI 영화 티저 경쟁 플랫폼",
    template: "%s · CONPICKS",
  },
  description:
    "AI 창작자의 2~3분 영화 티저를 발견하고, 좋아요·공유·펀딩으로 흥행을 결정하세요.",
  applicationName: "CONPICKS",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0F1014",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body
        className="min-h-dvh bg-bg-base text-text-primary antialiased"
        style={{ fontFamily: "Pretendard, var(--font-inter), system-ui, sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
