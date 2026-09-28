// Resolves optional media dropped into /public (see README_IMAGES.md).
import manifestJson from "@/data/assets.generated.json";

const manifest = manifestJson as { covers: string[]; videos: string[]; cuts: string[] };

const covers = new Set(manifest.covers);
const videos = new Set(manifest.videos);
const cuts = new Set(manifest.cuts);
const EXT = ["jpg", "jpeg", "png", "webp", "avif"];

function find(set: Set<string>, base: string, dir: string) {
  for (const e of EXT) if (set.has(`${base}.${e}`)) return `/${dir}/${base}.${e}`;
  return null;
}
/** `/covers/wt_01.jpg` if it exists, else null. */
export const coverSrc = (id: string) => find(covers, id, "covers");
/** `/covers/hero_wt_01.jpg` etc. */
export const heroSrc = (name: string) => find(covers, name, "covers");
export const cutSrc = (workId: string, n: number) => find(cuts, `cut_${workId}_${n}`, "cuts");
export const videoSrc = (name: string) => (videos.has(`${name}.mp4`) ? `/videos/${name}.mp4` : null);
