// Resolves optional media dropped into /public (see README_IMAGES.md).
import manifestJson from "@/data/assets.generated.json";

const manifest = manifestJson as unknown as {
  covers: string[];
  videos: string[];
  cuts: string[];
  sizes: Record<string, [number, number]>;
};

const covers = new Set(manifest.covers);
const videos = new Set(manifest.videos);
const EXT = ["jpg", "jpeg", "png", "webp", "avif"];

function find(set: Set<string>, base: string, dir: string) {
  for (const e of EXT) if (set.has(`${base}.${e}`)) return `/${dir}/${base}.${e}`;
  return null;
}
/** `/covers/wt_01.jpg` if it exists, else null. */
export const coverSrc = (id: string) => find(covers, id, "covers");
export const videoSrc = (name: string) => (videos.has(`${name}.mp4`) ? `/videos/${name}.mp4` : null);

/** Intrinsic [w, h] of a public file (e.g. "/covers/wt_01.png"). */
export const sizeOf = (src: string): [number, number] | null => manifest.sizes[src.replace(/^\//, "")] ?? null;
export const isPortrait = (src: string) => {
  const s = sizeOf(src);
  return !!s && s[1] > s[0] * 1.05;
};

/** Real episode pages for a work, in reading order: cut_{id}_1, _2, … (numeric sort). */
const cutsByWork = new Map<string, string[]>();
for (const f of manifest.cuts) {
  const m = f.match(/^cut_(.+)_(\d+)\.(\w+)$/);
  if (!m || !EXT.includes(m[3])) continue;
  const list = cutsByWork.get(m[1]) ?? [];
  list[Number(m[2]) - 1] = `/cuts/${f}`;
  cutsByWork.set(m[1], list);
}
export const cutsFor = (workId: string): string[] => (cutsByWork.get(workId) ?? []).filter(Boolean);
