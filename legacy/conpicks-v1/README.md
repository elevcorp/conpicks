# CONPICKS

AI 영화 티저 경쟁 플랫폼 — 대중 반응 데이터로 흥행 수요를 사전 예측하는 서비스.

## 빠른 시작

```bash
nvm use            # Node 22
npm install
cp .env.example .env.local   # 기본값(시드/목 모드)으로 바로 실행됨
npm run dev
```

기본은 **시드 모드**입니다 (`NEXT_PUBLIC_USE_SUPABASE=false`). 외부 서비스
설정 없이 홈·상세·피드·커뮤니티·심사·관리자·펀딩이 전부 동작합니다.
로그인 화면에서 시드 계정(운영자/심사위원/창작자/시청자)으로 원클릭 입장.

## 배포 (Vercel)

시드 모드는 **환경변수 0개**로 동작하므로 그대로 배포하면 됩니다.

```bash
# 1) GitHub에 올리기 (gh 로그인 후)
gh repo create conpicks --public --source=. --remote=origin --push

# 2) Vercel 연결 + 첫 배포 (vercel 로그인 후)
vercel link --yes
vercel --prod
```

- Vercel 대시보드에서 GitHub 저장소를 연결하면 이후 `git push`마다 자동 배포됩니다.
- 배포 URL이 나오면 필요 시 환경변수 `NEXT_PUBLIC_SITE_URL`(공유 링크용),
  `CRON_SECRET`(랭킹 크론 잠금)을 설정합니다. 없어도 동작합니다.
- 랭킹 재계산 크론은 Hobby 플랜 기준 **1일 1회**(`vercel.json`). Pro/셀프호스트는
  5분 주기 크론을 추가하면 실시간 랭킹이 됩니다.
- ⚠️ 시드 모드의 데이터는 서버 인스턴스 메모리에 있어 Vercel 서버리스에서는
  좋아요·업로드 등 쓰기가 요청 간 안정적으로 공유되지 않습니다. "둘러보기" 데모용
  으로는 충분하며, 다인 인터랙션 데모는 아래 Supabase 연결을 권장합니다.

## Supabase 연결

1. 프로젝트 생성 후 `supabase/migrations/0001~0004` → `supabase/seed/seed.sql` 실행
2. `.env.local`에 `NEXT_PUBLIC_USE_SUPABASE=true` + URL/키 입력
3. Auth 대시보드에서 Google/Kakao provider + redirect(`/auth/callback`) 설정

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm test` | Vitest (랭킹 엔진 등) |
| `npm run e2e` | Playwright 핵심 플로우 |

## 구조

- `app/(public)` 홈/탐색/상세 · `app/(auth)` 로그인 · `app/onboarding` 역할·프로필
- `app/reviewer` 1차 심사 · `app/admin` 운영 · `app/feed` 숏폼
- `lib/ranking` 랭킹 순수함수 · `lib/data` 데이터 파사드 · `lib/supabase` 클라이언트
- `supabase/migrations` 스키마·RLS·트리거·랭킹 함수

결정 로그: `DECISIONS.md`
