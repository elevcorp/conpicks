"use client";
// Procedural, deterministic SVG "art" used wherever real covers / cuts are missing.
// Genre picks the motif set, the work's themeColor picks the palette, the seed
// varies composition — so 24 works × N cuts all look distinct yet on-brand.
import { memo, useId } from "react";
import { withLightness, mix } from "@/lib/color";
import { rng } from "@/lib/seed";
import type { GenreKey } from "@/lib/types";

export type ArtVariant = "poster" | "wide" | "square" | "cut";
export type CutMode = "scene" | "closeup" | "impact";

const HEIGHT: Record<ArtVariant, number> = { poster: 300, wide: 112.5, square: 200, cut: 260 };

export const GENRE_EMOJI: Record<string, string> = {
  rofan: "👑", murim: "⚔️", thriller: "🪶", healing: "🍲", daily: "☕", romance: "💌",
  sfromance: "💠", action: "⚡", fantasy: "📜", school: "🦊", drama: "🎬", film: "🎞️",
};

interface Props {
  seed: string;
  theme: string;
  genre: GenreKey | "film";
  variant?: ArtVariant;
  mode?: CutMode;
  className?: string;
}

function SceneArtImpl({ seed, theme, genre, variant = "poster", mode = "scene", className }: Props) {
  const r = rng(seed);
  const W = 200;
  const H = HEIGHT[variant];
  const hueShift = (r() - 0.5) * 0.18;
  const skyTop = withLightness(theme, 0.08 + r() * 0.04, 0.9);
  const skyBot = shiftHue(withLightness(theme, 0.28 + r() * 0.08, 1), hueShift);
  const glow = withLightness(theme, 0.72, 1);
  const ink = withLightness(theme, 0.05, 0.7);
  const mid = mix(ink, skyBot, 0.35);
  const id = `g${useId().replace(/[^a-z0-9]/gi, "")}`;
  const horizon = H * (variant === "wide" ? 0.72 : 0.66);

  const moonX = 40 + r() * 120;
  const moonY = H * (0.18 + r() * 0.14);
  const moonR = (variant === "wide" ? 14 : 20) + r() * 14;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBot} />
        </linearGradient>
        <radialGradient id={`${id}g`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={glow} stopOpacity="0.9" />
          <stop offset="0.35" stopColor={glow} stopOpacity="0.35" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ink} stopOpacity="0" />
          <stop offset="1" stopColor={ink} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}s)`} />

      {mode === "impact" ? (
        Impact({ W, H, r, glow, id })
      ) : (
        <>
          <circle cx={moonX} cy={moonY} r={moonR * 3} fill={`url(#${id}g)`} opacity={0.55} />
          {motif(genre, { W, H, r, horizon, moonX, moonY, moonR, glow, ink, mid, skyBot })}
          {mode === "closeup" ? Figure({ W, H, ink, glow, big: true }) : variant !== "wide" && r() > 0.35 && Figure({ W, H, ink, glow })}
        </>
      )}
      <rect width={W} height={H} fill={`url(#${id}f)`} opacity={0.6} />
    </svg>
  );
}
export const SceneArt = memo(SceneArtImpl);

function shiftHue(hex: string, t: number) {
  return t > 0 ? mix(hex, "#3a2a6a", t * 2) : mix(hex, "#1f4a5a", -t * 2);
}

interface Ctx {
  W: number; H: number; r: () => number; horizon: number;
  moonX: number; moonY: number; moonR: number;
  glow: string; ink: string; mid: string; skyBot: string;
}

const PERIOD = new Set(["rofan", "murim", "thriller", "fantasy"]);

function motif(genre: string, c: Ctx) {
  // ~35% of seeds get an alternate establishing shot so episode thumbnails vary.
  if (c.r() < 0.35) {
    return PERIOD.has(genre) ? (
      <>{Moon({ ...c, crescent: c.r() > 0.5 })}{Stars({ ...c, n: 14 })}{Mountains({ ...c, layers: 3 })}</>
    ) : (
      <>{Moon({ ...c, crescent: true })}{Bokeh({ ...c, n: 14, warm: genre === "healing" || genre === "daily" })}{Skyline({ ...c, lit: true })}{Lamp(c)}</>
    );
  }
  switch (genre) {
    case "rofan":
      return <>{Moon(c)}{Stars({ ...c, n: 16 })}{Castle(c)}</>;
    case "murim":
      return <>{Sun(c)}{Mountains({ ...c, layers: 4 })}{Birds(c)}</>;
    case "thriller":
      return <>{Moon({ ...c, tint: "#c0392b" })}{DeadTrees(c)}{Feathers(c)}</>;
    case "healing":
      return <>{Bokeh({ ...c, n: 10, warm: true })}{House(c)}{Steam(c)}</>;
    case "daily":
      return <>{Bokeh({ ...c, n: 8, warm: true })}{Skyline({ ...c, lit: true })}{Lamp(c)}</>;
    case "romance":
    case "sfromance":
      return <>{Moon({ ...c, crescent: true })}{Bokeh({ ...c, n: 18 })}{Skyline({ ...c, lit: true })}</>;
    case "action":
      return <>{Rift(c)}{Skyline(c)}{Slash(c)}</>;
    case "fantasy":
      return <>{Orb(c)}{Forest(c)}{Fog(c)}</>;
    case "school":
      return <>{Moon(c)}{Stars({ ...c, n: 12 })}{Rooftop(c)}</>;
    case "drama":
      return <>{Spotlight(c)}{Stars({ ...c, n: 10 })}{Mountains({ ...c, layers: 2 })}</>;
    default:
      return <>{Spotlight(c)}{Bokeh({ ...c, n: 12 })}{Skyline(c)}</>;
  }
}

function Moon({ moonX, moonY, moonR, glow, crescent, tint, skyBot }: Ctx & { crescent?: boolean; tint?: string }) {
  const fill = tint ? mix(tint, glow, 0.25) : mix(glow, "#ffffff", 0.55);
  return (
    <g>
      <circle cx={moonX} cy={moonY} r={moonR} fill={fill} opacity={0.95} />
      {crescent && <circle cx={moonX + moonR * 0.45} cy={moonY - moonR * 0.2} r={moonR * 0.92} fill={skyBot} opacity={0.92} />}
    </g>
  );
}
function Sun({ moonX, moonY, moonR, glow }: Ctx) {
  return <circle cx={moonX} cy={moonY + 10} r={moonR * 1.2} fill={mix(glow, "#ff6b3d", 0.45)} opacity={0.8} />;
}
function Stars({ W, H, r, n, glow }: Ctx & { n: number }) {
  return (
    <g fill={mix(glow, "#fff", 0.7)}>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={r() * W} cy={r() * H * 0.55} r={0.4 + r() * 1.1} opacity={0.4 + r() * 0.6} />
      ))}
    </g>
  );
}
function Bokeh({ W, H, r, n, glow, warm }: Ctx & { n: number; warm?: boolean }) {
  const c = warm ? mix(glow, "#ffb347", 0.6) : glow;
  return (
    <g fill={c}>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={r() * W} cy={H * 0.2 + r() * H * 0.6} r={2 + r() * 9} opacity={0.08 + r() * 0.22} />
      ))}
    </g>
  );
}
function Mountains({ W, horizon, r, ink, mid, layers }: Ctx & { layers: number }) {
  return (
    <g>
      {Array.from({ length: layers }, (_, li) => {
        const base = horizon - 30 + li * 18;
        const pts: string[] = [`0,${base + 60}`];
        const steps = 5 + li;
        for (let i = 0; i <= steps; i++) pts.push(`${(W / steps) * i},${base - 10 - r() * (46 - li * 8)}`);
        pts.push(`${W},${base + 400}`, `0,${base + 400}`);
        return <polygon key={li} points={pts.join(" ")} fill={mix(mid, ink, li / layers)} opacity={0.75 + li * 0.08} />;
      })}
    </g>
  );
}
function Castle({ W, horizon, ink, r, glow }: Ctx) {
  const cx = W * (0.3 + r() * 0.4);
  const towers = [-44, -24, 0, 24, 44];
  return (
    <g fill={ink}>
      <rect x={0} y={horizon + 20} width={W} height={400} />
      {towers.map((dx, i) => {
        const h = i === 2 ? 92 : i % 2 ? 62 : 44;
        const x = cx + dx - 7;
        return (
          <g key={i}>
            <rect x={x} y={horizon + 24 - h} width={14} height={h} />
            <polygon points={`${x - 2},${horizon + 24 - h} ${x + 7},${horizon + 4 - h - (i === 2 ? 22 : 12)} ${x + 16},${horizon + 24 - h}`} />
            <rect x={x + 5} y={horizon + 40 - h} width={3} height={5} fill={glow} opacity={0.8} />
          </g>
        );
      })}
      <rect x={cx - 50} y={horizon - 10} width={100} height={40} />
    </g>
  );
}
function DeadTrees({ W, horizon, ink, r }: Ctx) {
  return (
    <g stroke={ink} strokeLinecap="round" fill="none">
      <rect x={0} y={horizon + 10} width={W} height={400} fill={ink} stroke="none" />
      {Array.from({ length: 5 }, (_, i) => {
        const x = (W / 5) * i + r() * 30;
        const h = 60 + r() * 60;
        const b = horizon + 12;
        return (
          <g key={i} strokeWidth={2 + r() * 2}>
            <path d={`M${x},${b} L${x + 2},${b - h}`} />
            <path d={`M${x + 1},${b - h * 0.5} L${x - 14},${b - h * 0.8}`} strokeWidth={1.4} />
            <path d={`M${x + 2},${b - h * 0.7} L${x + 16},${b - h * 0.95}`} strokeWidth={1.2} />
          </g>
        );
      })}
    </g>
  );
}
function Feathers({ W, H, r }: Ctx) {
  return (
    <g fill="#d63a3a">
      {Array.from({ length: 9 }, (_, i) => (
        <ellipse key={i} cx={r() * W} cy={r() * H * 0.85} rx={1.4} ry={4.5} transform={`rotate(${r() * 90 - 45})`} opacity={0.5 + r() * 0.5} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
      ))}
    </g>
  );
}
function House({ W, horizon, ink, glow, r }: Ctx) {
  const x = W * (0.25 + r() * 0.3);
  const warm = mix(glow, "#ffb347", 0.7);
  return (
    <g>
      <rect x={0} y={horizon + 16} width={W} height={400} fill={ink} />
      <rect x={x} y={horizon - 40} width={86} height={60} fill={ink} />
      <polygon points={`${x - 8},${horizon - 38} ${x + 43},${horizon - 70} ${x + 94},${horizon - 38}`} fill={ink} />
      <rect x={x + 12} y={horizon - 24} width={30} height={22} fill={warm} opacity={0.9} />
      <rect x={x + 54} y={horizon - 26} width={18} height={46} fill={warm} opacity={0.55} />
      <rect x={x + 6} y={horizon - 44} width={74} height={9} rx={2} fill={mix(warm, ink, 0.4)} />
    </g>
  );
}
function Steam({ W, horizon, r }: Ctx) {
  const x = W * (0.35 + r() * 0.2);
  return (
    <g stroke="#fff" strokeOpacity={0.25} strokeWidth={2} fill="none" strokeLinecap="round">
      {[0, 10, 20].map((d) => (
        <path key={d} d={`M${x + d},${horizon - 76} q-6,-10 0,-20 q6,-10 0,-20`} />
      ))}
    </g>
  );
}
function Skyline({ W, horizon, ink, r, glow, lit }: Ctx & { lit?: boolean }) {
  const bldgs: React.ReactNode[] = [];
  let x = -4;
  while (x < W) {
    const w = 12 + r() * 22;
    const h = 30 + r() * 80;
    bldgs.push(<rect key={x} x={x} y={horizon + 20 - h} width={w} height={h + 400} fill={ink} />);
    if (lit)
      for (let k = 0; k < 4; k++)
        if (r() > 0.45)
          bldgs.push(<rect key={`${x}-${k}`} x={x + 3 + r() * (w - 8)} y={horizon + 26 - h + r() * h * 0.8} width={2.4} height={2.4} fill={mix(glow, "#ffd27a", 0.6)} opacity={0.85} />);
    x += w + 1;
  }
  return <g>{bldgs}</g>;
}
function Lamp({ W, horizon, glow, ink }: Ctx) {
  const x = W * 0.78;
  return (
    <g>
      <circle cx={x} cy={horizon - 48} r={26} fill={mix(glow, "#ffcf6b", 0.7)} opacity={0.18} />
      <rect x={x - 1.2} y={horizon - 48} width={2.4} height={80} fill={ink} />
      <circle cx={x} cy={horizon - 48} r={4} fill="#ffe3a3" />
    </g>
  );
}
function Rift({ W, H, r, glow }: Ctx) {
  const x = W * (0.3 + r() * 0.4);
  const pts = Array.from({ length: 7 }, (_, i) => `${x + (r() - 0.5) * 24},${H * 0.08 + i * H * 0.08}`).join(" ");
  return (
    <g>
      <polyline points={pts} stroke={mix(glow, "#7ad7ff", 0.5)} strokeWidth={10} opacity={0.25} fill="none" />
      <polyline points={pts} stroke="#e8f7ff" strokeWidth={2} fill="none" />
    </g>
  );
}
function Slash({ W, H, glow }: Ctx) {
  return (
    <g stroke={mix(glow, "#fff", 0.5)} strokeLinecap="round">
      <line x1={-10} y1={H * 0.75} x2={W + 10} y2={H * 0.35} strokeWidth={1.4} opacity={0.7} />
      <line x1={-10} y1={H * 0.8} x2={W + 10} y2={H * 0.42} strokeWidth={0.6} opacity={0.5} />
    </g>
  );
}
function Orb({ moonX, moonY, glow }: Ctx) {
  return (
    <g>
      <circle cx={moonX} cy={moonY + 30} r={36} fill={mix(glow, "#9dffcf", 0.4)} opacity={0.2} />
      <circle cx={moonX} cy={moonY + 30} r={7} fill="#f2fff8" opacity={0.95} />
    </g>
  );
}
function Forest({ W, horizon, ink, mid, r }: Ctx) {
  return (
    <g>
      {[0, 1].map((layer) => (
        <g key={layer} fill={layer ? ink : mid}>
          {Array.from({ length: 11 }, (_, i) => {
            const x = (W / 10) * i + (r() - 0.5) * 12 - layer * 8;
            const h = 50 + r() * 60 + layer * 20;
            const b = horizon + 20 + layer * 16;
            return <polygon key={i} points={`${x - 12 - layer * 3},${b} ${x},${b - h} ${x + 12 + layer * 3},${b}`} />;
          })}
          <rect x={0} y={horizon + 18 + layer * 16} width={W} height={400} />
        </g>
      ))}
    </g>
  );
}
function Fog({ W, horizon }: Ctx) {
  return <rect x={0} y={horizon - 6} width={W} height={24} fill="#fff" opacity={0.07} />;
}
function Rooftop({ W, horizon, ink }: Ctx) {
  return (
    <g fill={ink}>
      <rect x={0} y={horizon + 10} width={W} height={400} />
      {Array.from({ length: 21 }, (_, i) => (
        <rect key={i} x={i * 10} y={horizon - 22} width={1.6} height={34} />
      ))}
      <rect x={0} y={horizon - 22} width={W} height={2.4} />
      <rect x={0} y={horizon - 6} width={W} height={1.4} />
    </g>
  );
}
function Birds({ W, H, r, ink }: Ctx) {
  return (
    <g stroke={ink} strokeWidth={1.2} fill="none" strokeLinecap="round">
      {Array.from({ length: 4 }, (_, i) => {
        const x = W * 0.2 + r() * W * 0.6;
        const y = H * 0.2 + r() * H * 0.2;
        return <path key={i} d={`M${x - 5},${y} q5,-4 5,0 q0,-4 5,0`} />;
      })}
    </g>
  );
}
function Spotlight({ W, H, glow }: Ctx) {
  return <polygon points={`${W * 0.42},0 ${W * 0.58},0 ${W * 0.85},${H} ${W * 0.15},${H}`} fill={glow} opacity={0.12} />;
}
function Figure({ W, H, ink, glow, big }: { W: number; H: number; ink: string; glow: string; big?: boolean }) {
  const s = big ? 2.1 : 1;
  const cx = W / 2;
  const base = H + 2;
  const headR = 15 * s;
  const headY = base - 70 * s;
  return (
    <g>
      <circle cx={cx} cy={headY} r={headR + 5 * s} fill={glow} opacity={0.12} />
      <path
        d={`M${cx - 52 * s},${base} C${cx - 48 * s},${base - 36 * s} ${cx - 28 * s},${base - 46 * s} ${cx - 12 * s},${base - 50 * s}
            L${cx + 12 * s},${base - 50 * s} C${cx + 28 * s},${base - 46 * s} ${cx + 48 * s},${base - 36 * s} ${cx + 52 * s},${base} Z`}
        fill={ink}
      />
      <rect x={cx - 6 * s} y={headY + headR - 4 * s} width={12 * s} height={20 * s} fill={ink} />
      <ellipse cx={cx} cy={headY} rx={headR * 0.9} ry={headR} fill={ink} />
    </g>
  );
}
function Impact({ W, H, r, id }: { W: number; H: number; r: () => number; glow: string; id: string }) {
  const cx = W / 2, cy = H / 2;
  return (
    <g>
      <circle cx={cx} cy={cy} r={Math.max(W, H)} fill={`url(#${id}g)`} opacity={0.5} />
      <g stroke="#fff" strokeLinecap="round">
        {Array.from({ length: 48 }, (_, i) => {
          const a = (i / 48) * Math.PI * 2 + r() * 0.05;
          const r1 = 28 + r() * 30;
          const r2 = 220;
          // trig can differ in the last ulp between Node and browsers → round for hydration
          const q = (n: number) => Math.round(n * 100) / 100;
          return <line key={i} x1={q(cx + Math.cos(a) * r1)} y1={q(cy + Math.sin(a) * r1)} x2={q(cx + Math.cos(a) * r2)} y2={q(cy + Math.sin(a) * r2)} strokeWidth={0.3 + r() * 1.3} opacity={0.25 + r() * 0.5} />;
        })}
      </g>
      <circle cx={cx} cy={cy} r={10} fill="#fff" opacity={0.9} />
    </g>
  );
}
