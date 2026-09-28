// Scans /public for optional media so components can swap placeholders for
// real files without code changes. Runs automatically before dev/build.
import { readdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const list = (dir) => {
  const p = join(root, "public", dir);
  return existsSync(p) ? readdirSync(p).filter((f) => !f.startsWith(".")) : [];
};

const manifest = {
  covers: list("covers"),
  videos: list("videos"),
  cuts: list("cuts"),
};

writeFileSync(
  join(root, "src/data/assets.generated.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
  `[assets] covers ${manifest.covers.length} · videos ${manifest.videos.length} · cuts ${manifest.cuts.length}`,
);
