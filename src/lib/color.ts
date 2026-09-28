// Color math for per-work dynamic themes (WCAG-aware).
type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const rgbToHex = ([r, g, b]: RGB) =>
  "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

export function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h /= 6;
  return [h, s, l];
}
export function hslToRgb(h: number, s: number, l: number): RGB {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const hue = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue(p, q, h + 1 / 3) * 255, hue(p, q, h) * 255, hue(p, q, h - 1 / 3) * 255];
}
export const withLightness = (hex: string, l: number, satMul = 1) => {
  const [h, s] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb(h, Math.min(1, s * satMul), l));
};
export const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
};
export const rgba = (hex: string, a: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
/** White or ink — whichever clears 4.5:1 (one of them always does). */
export const readableText = (bg: string) => (contrast(bg, "#FFFFFF") >= contrast(bg, "#191F28") ? "#FFFFFF" : "#191F28");

/**
 * Dynamic theme tokens for a work detail page. Returns CSS custom properties
 * for BOTH modes so SSR output is theme-agnostic (CSS picks by html[data-theme]).
 */
export function workThemeVars(theme: string): Record<string, string> {
  const [, , L] = rgbToHsl(hexToRgb(theme));
  // Dark: pull the cover color down to 30~40% lightness band, then fade into near-black.
  const dTop = withLightness(theme, Math.min(0.34, Math.max(0.24, L * 0.6)), 0.85);
  const dBottom = mix(dTop, "#0B0B0B", 0.72);
  const dAccent = withLightness(theme, 0.66, 0.9);
  // Light: the cover color itself (slightly softened), darkening toward the bottom.
  const lTop = mix(theme, "#FFFFFF", 0.12);
  const lBottom = mix(lTop, "#000000", 0.18);
  const lFg = readableText(mix(lTop, lBottom, 0.5));
  const lAccent = lFg === "#FFFFFF" ? withLightness(theme, 0.8, 0.8) : withLightness(theme, 0.3, 0.9);

  const vars = (p: string, top: string, bottom: string, fg: string, accent: string) => ({
    [`--${p}-top`]: top,
    [`--${p}-bottom`]: bottom,
    [`--${p}-fg`]: fg,
    [`--${p}-fg2`]: rgba(fg, 0.72),
    [`--${p}-fg3`]: rgba(fg, 0.5),
    [`--${p}-surface`]: rgba(accent, 0.15),
    [`--${p}-chip`]: rgba(accent, 0.26),
    [`--${p}-line`]: rgba(accent, 0.3),
    [`--${p}-solid`]: top,
  });
  return {
    ...vars("wd", dTop, dBottom, readableText(dTop), dAccent),
    ...vars("wl", lTop, lBottom, lFg, lAccent),
  };
}

/** Pastel card background for "이달의 신작" style cards. */
export const pastel = (theme: string) => withLightness(theme, 0.86, 0.75);
export const deepTone = (theme: string) => withLightness(theme, 0.22, 0.8);
