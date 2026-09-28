/** 24000 → "2.4만", 8400 → "8.4천", 1847 → "1,847" */
export function compact(n: number): string {
  if (n >= 100_000_000) return `${+(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${+(n / 10_000).toFixed(1)}만`;
  if (n >= 1_000) return `${+(n / 1_000).toFixed(1)}천`;
  return String(n);
}
export const won = (n: number) => n.toLocaleString("ko-KR");
export function eok(n: number) {
  const e = n / 100_000_000;
  return `${+e.toFixed(2)}억`;
}
