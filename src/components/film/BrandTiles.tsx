import Link from "next/link";
import { Clapperboard, Sparkles, Award, HandCoins } from "lucide-react";

const TILES = [
  { href: "/film/ranking", label: "SEASON 1", sub: "대중 검증 랭킹", icon: Clapperboard, from: "#1b3a8a", to: "#3182F6" },
  { href: "/film/collection/jimovie", label: "지무비 PICK", sub: "리뷰 누적 1,100만", icon: Sparkles, from: "#6b2a8a", to: "#c05bd6" },
  { href: "/film/collection/awards", label: "수상작", sub: "프리시즌 4편", icon: Award, from: "#7a5a12", to: "#e0b43a" },
  { href: "/film/funding", label: "펀딩 진행중", sub: "달성 74% · D-12", icon: HandCoins, from: "#0f5a4a", to: "#2fc49a" },
];

/** Disney+ brand-tile homage: glass tiles with a colored glow, hover zoom. */
export function BrandTiles() {
  return (
    <div className="grid grid-cols-2 gap-2.5 px-4 md:grid-cols-4 md:gap-4 md:px-0">
      {TILES.map(({ href, label, sub, icon: Icon, from, to }) => (
        <Link
          key={label}
          href={href}
          className="glass group relative flex aspect-[16/8] flex-col justify-end overflow-hidden rounded-2xl p-3.5 transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_18px_50px_rgba(49,130,246,0.3)] md:aspect-[16/9] md:p-5"
        >
          <span className="absolute -right-8 -top-10 size-36 rounded-full opacity-50 blur-2xl transition-opacity group-hover:opacity-80" style={{ background: `radial-gradient(circle, ${to}, ${from})` }} />
          <Icon className="absolute right-3.5 top-3.5 text-white/80 md:right-5 md:top-5" size={22} />
          <p className="relative text-[16px] font-black tracking-tight md:text-[20px]">{label}</p>
          <p className="relative text-[11.5px] text-white/65 md:text-[13px]">{sub}</p>
        </Link>
      ))}
    </div>
  );
}
