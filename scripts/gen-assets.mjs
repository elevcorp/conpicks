// Scans /public for optional media so components can swap placeholders for
// real files without code changes, and regenerates README_IMAGES.md with a
// live inventory. Runs automatically before dev/build.
import { readdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const list = (dir) => {
  const p = join(root, "public", dir);
  return existsSync(p) ? readdirSync(p).filter((f) => !f.startsWith(".")) : [];
};

/** [width, height] from PNG IHDR or JPEG SOF, without image deps. */
function dims(file) {
  const b = readFileSync(file);
  if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + len;
    }
  }
  return null;
}

const manifest = {
  covers: list("covers"),
  videos: list("videos"),
  cuts: list("cuts"),
  /** "covers/wt_01.png" → [w, h]; lets components letterbox portrait art in 16:9 slots. */
  sizes: {},
};
for (const dir of ["covers", "cuts"])
  for (const f of manifest[dir]) {
    const d = dims(join(root, "public", dir, f));
    if (d) manifest.sizes[`${dir}/${f}`] = d;
  }

writeFileSync(join(root, "src/data/assets.generated.json"), JSON.stringify(manifest, null, 2) + "\n");

// ------------------------------------------------------------ README_IMAGES.md
const json = (f) => JSON.parse(readFileSync(join(root, "src/data", f), "utf8"));
const webtoons = json("webtoons.json");
const films = json("films.json");
const IMG = ["jpg", "jpeg", "png", "webp", "avif"];
const has = (set, base) => IMG.some((e) => set.includes(`${base}.${e}`));
const mark = (ok) => (ok ? "✅" : "—");
const cutsOf = (id) => manifest.cuts.filter((f) => f.startsWith(`cut_${id}_`)).length;

const md = `# README_IMAGES — 이미지 · 영상 교체 가이드

> 이 파일은 \`npm run dev\` / \`npm run build\` 때마다 **자동 생성**됩니다 (\`scripts/gen-assets.mjs\`). 직접 수정하지 마세요.

파일을 아래 경로에 **이름 규칙대로 넣기만 하면** 코드 수정 없이 플레이스홀더가 교체됩니다. 확장자는 \`jpg · jpeg · png · webp · avif\` 모두 인식합니다. 넣은 뒤 개발 서버를 재시작(또는 재빌드)하세요.

## 이름 규칙 & 권장 사이즈

| 용도 | 경로 · 파일명 | 권장 사이즈 | 비고 |
|---|---|---|---|
| 웹툰 커버 | \`public/covers/wt_01.jpg\` ~ \`wt_24.jpg\` | 600×900 (2:3) | 카드·작품홈·랭킹 전역 |
| 영화 티저 커버 | \`public/covers/fm_01.jpg\` ~ \`fm_24.jpg\` | 1600×900 (16:9) | 현재 기존 AI 티저 아트(png) 적용됨 |
| 웹툰 홈 히어로 | \`public/covers/hero_wt_01.jpg\` ~ \`hero_wt_03.jpg\` | 1600×900 | 없으면 1~3위 작품 커버 사용 |
| 영화 홈 빌보드 | \`public/covers/hero_fm_01.jpg\` ~ \`hero_fm_03.jpg\` | 1600×900 | 없으면 시즌 1~3위 커버 사용 |
| 뷰어 컷 | \`public/cuts/cut_wt_04_1.jpg\` ~ \`cut_wt_04_8.jpg\` | 800×1200 | 작품당 최대 8컷, 회차마다 순환 |
| 히어로 영상 | \`public/videos/hero_wt_01.mp4\`, \`hero_fm_01.mp4\` … | 1600×900 | 있으면 이미지 대신 무음 루프 재생 |
| 작품 커버 영상 | \`public/videos/cover_wt_01.mp4\`, \`cover_fm_01.mp4\` … | 1600×900 | 작품홈·랭킹 1위·피드·티저 상세 |

**영상 권장 사양:** mp4 (H.264), 5~10초 루프, 1600×900, 5MB 이하, 무음 트랙이어도 무방. 영상이 없으면 이미지에 Ken Burns(천천히 줌·팬) + 빛 번짐 효과가 자동 적용됩니다.

**금지:** 실존 웹툰·영화·인물 이미지, 타 플랫폼 로고.

## 현재 상태

- 커버 ${manifest.covers.length}개 · 영상 ${manifest.videos.length}개 · 뷰어 컷 ${manifest.cuts.length}개

### 웹툰 (${webtoons.length})

| id | 제목 | 커버 | 커버 영상 | 뷰어 컷 |
|---|---|:-:|:-:|:-:|
${webtoons.map((w) => `| ${w.id} | ${w.title} | ${mark(has(manifest.covers, w.id))} | ${mark(manifest.videos.includes(`cover_${w.id}.mp4`))} | ${cutsOf(w.id) || "—"} |`).join("\n")}

### 영화 티저 (${films.length})

| id | 제목 | 커버 | 커버 영상 |
|---|---|:-:|:-:|
${films.map((f) => `| ${f.id} | ${f.title} | ${mark(has(manifest.covers, f.id))} | ${mark(manifest.videos.includes(`cover_${f.id}.mp4`))} |`).join("\n")}

### 히어로

| 슬롯 | 이미지 | 영상 |
|---|:-:|:-:|
${[1, 2, 3].flatMap((n) => ["wt", "fm"].map((w) => { const k = `hero_${w}_0${n}`; return `| ${k} | ${mark(has(manifest.covers, k))} | ${mark(manifest.videos.includes(`${k}.mp4`))} |`; })).join("\n")}
`;
writeFileSync(join(root, "README_IMAGES.md"), md);

console.log(`[assets] covers ${manifest.covers.length} · videos ${manifest.videos.length} · cuts ${manifest.cuts.length} → README_IMAGES.md`);
