/** Small display formatters shared across the UI. */

export function compactCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10_000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "천";
  if (n < 100_000_000)
    return Math.round(n / 1000) / 10 >= 1
      ? (n / 10_000).toFixed(1).replace(/\.0$/, "") + "만"
      : String(n);
  return (n / 100_000_000).toFixed(1).replace(/\.0$/, "") + "억";
}

export function krw(n: number): string {
  return "₩" + n.toLocaleString("ko-KR");
}

export function runtime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function timeAgo(iso: string, now = Date.now()): string {
  const diff = now - Date.parse(iso);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}주 전`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}개월 전`;
  return `${Math.floor(d / 365)}년 전`;
}

export function dday(iso: string, now = Date.now()): string {
  const d = Math.ceil((Date.parse(iso) - now) / 86_400_000);
  if (d > 0) return `D-${d}`;
  if (d === 0) return "D-DAY";
  return `종료`;
}
