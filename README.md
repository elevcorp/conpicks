# CNPX (컨픽스) — 웹서비스 목업

AI 콘텐츠의 **검증 · 연재 · IP화** 플랫폼 시연용 목업. 하나의 앱 안에 두 월드가 있습니다.

- **AI 웹툰 월드** (`/`) — 신작 리그 → 정식 연재 승격 → 실시간 랭킹 → 영상화 IP, 미리보기 유료 결제 BM
- **AI 영화 월드** (`/film`) — 2~3분 티저 컨테스트 → 대중 검증 랭킹 → 우승작 제작 펀딩

백엔드 없이 목데이터(`src/data/*.json`) + 세션 메모리(Zustand)로 모든 화면이 동작합니다. 로그인·결제·업로드는 “시연 모드” UI로 마감되어 있어 막다른 화면이 없습니다.

## 빠른 시작

```bash
nvm use          # Node 22
npm install
npm run dev      # http://localhost:3000
```

| 명령 | 설명 |
|---|---|
| `npm run dev` / `npm run build` | 개발 서버 / 프로덕션 빌드 (둘 다 먼저 `public/` 미디어를 스캔해 `README_IMAGES.md` 갱신) |
| `npm run gen:data` | 회차·댓글·랭킹 목데이터 재생성 (`scripts/gen-data.mjs`) |
| `npm run smoke` | 개발 서버 실행 중 26개 라우트 × 모바일/PC 콘솔·HTTP 에러 검사 |
| `npm run shots -- http://localhost:3000 screenshots` | 주요 화면 모바일/PC 스크린샷 (`THEME=light`로 라이트 모드) |

## 5분 시연 동선

1. **스플래시 → 웹툰 홈** — 움직이는 히어로(1~3위), 실시간 랭킹, 지무비 PICK.
2. **상단 `웹툰 | 영화` 토글** — 월드 전체가 커튼 전환되며 딥 네이비 시네마틱 톤으로 바뀝니다. 다시 토글해 돌아옵니다.
3. **골목 끝 심야식당** (홈 ▸ 이달의 신작, 또는 `/work/wt_04`) — 작품홈 전체가 핑크로 물듭니다. 다른 작품(달빛 아래 계약자=버건디, 천마신교=네이비)으로 옮겨 가며 테마 변화를 보여주세요.
4. **첫 화 보기 탭** → 하단 “다음화 보기” → 2화 → 3화 끝의 **페이월** → `미리보기로 이어보기` → 캐시 1,000 → 700 → 4화가 열립니다. 네 번째 미리보기에서 잔액 부족 → 충전 시트(시연 결제) → 바로 이어서 결제.
5. **작품홈 ▸ 정보 탭** — 검증 데이터(❤·공유·저장), IP 확장 스텝, 지무비 리뷰.
6. **신작 리그** — “정식 연재까지 78%” 승격 게이지, `내 작품 올리기` 시트.
7. **영화 월드 ▸ 역병: 붉은 징조** — 랭킹 점수 구성 바 · 흥행 수요 지수 → **원작 웹툰 카드**를 누르면 월드 전환과 함께 웹툰 `붉은 징조` 작품홈으로 이동 (하나의 IP 파이프라인).
8. **펀딩** — 목표 3억 · 74% · D-12 → 참여 금액 선택 → 달성률 실시간 반영.
9. **설정** — 다크/라이트 전환. 시연을 처음부터 다시 하려면 `설정 ▸ 시연 데이터 초기화`.

## 구조

```
src/
  app/(webtoon)   /, /weekly, /ranking, /league, /work/[id], /viewer/[id]/[ep], /library, /my
  app/(film)      /film, /film/feed, /film/ranking, /film/funding, /film/work/[id], /film/collection/[slug]
  app/            /settings, /search, /notifications
  components/     common(월드 스위처·네비·시트·플레이스홀더 아트) · webtoon · film
  data/           webtoons · films · episodes · comments · rankings · funding · community (.json)
  store/          theme · world · user(캐시·찜·구매) · ui(토스트·시트) · prefs
scripts/          gen-data · gen-assets · smoke · screenshots
```

- 이미지·영상 교체: **[README_IMAGES.md](README_IMAGES.md)** (파일만 넣으면 자동 반영)
- 결정 로그: **[DECISIONS.md](DECISIONS.md)**
- 이전 CONPICKS 풀스택 앱: `legacy/conpicks-v1/` (빌드 대상 아님)

## 배포 (Vercel)

환경변수 없이 그대로 배포됩니다. 모든 페이지는 정적 생성(SSG)이며, 뷰어 일부 회차만 첫 요청 시 생성·캐시됩니다.

```bash
vercel          # 프리뷰 배포
vercel --prod   # 프로덕션
```

> ⚠️ 저장소의 `.vercel/`은 이전 CONPICKS 프로젝트에 연결되어 있을 수 있습니다. 별도 프로젝트로 배포하려면 `vercel link`로 새 프로젝트를 연결하세요.
