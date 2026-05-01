# Contributing

이 문서는 `farewell-naver-blog`에 기여하거나 로컬에서 개발할 때 필요한 정보를 정리합니다.

## 요구 사항

- Node.js 24 LTS
- pnpm
- Bun

## 설치

```bash
pnpm install
```

## 개발 서버

```bash
pnpm dev
```

- 개발 서버 주소: [http://localhost:4173](http://localhost:4173)
- `pnpm start`는 사용자용 실행 기준이고, 개발 중에는 `pnpm dev`를 사용합니다.

## 주요 검증 명령

- `pnpm check:local`: 저장소 파일 변경 뒤 기본 회귀
- `pnpm check:unused`: source, test, script 코드의 unused 기준선 확인
- `pnpm check:full`: `check:local`과 mock UI smoke 회귀 확인
- `pnpm typecheck`: TypeScript 계약 확인
- `pnpm test:offline`: Vitest와 sample fixture export 결과 확인
- `pnpm smoke:ui`: scan -> export -> upload 결과 화면 확인
- `pnpm test:network:resume-export`: live Naver resume export 확인
- `pnpm test:network:resume-export:se2-table`: live SE2 table resume export 확인
- `pnpm test:coverage`: coverage 게이트 확인

## 업로드 E2E 검증

`pnpm test:network:upload`는 opt-in 검증입니다.

- 고정 업로드 대상: GitHub `mym0404/image-archive`
- 고정 branch: `master`
- 고정 path: `/`
- 필수 환경 변수: `FAREWELL_UPLOAD_E2E=1`, `FAREWELL_UPLOAD_E2E_GITHUB_TOKEN`

예시:

```bash
FAREWELL_UPLOAD_E2E=1 \
FAREWELL_UPLOAD_E2E_GITHUB_TOKEN=ghp_xxx \
pnpm test:network:upload
```

## API

- `GET /api/export-defaults`
- `POST /api/scan`
- `POST /api/export`
- `GET /api/export/:jobId`
- `POST /api/export/:jobId/upload`
- `GET /api/export/:jobId/manifest`

## 프로젝트 구조

- `src/modules/fetcher`: 네이버 블로그 스캔, 글/자산 fetch
- `src/modules/parser`: SE2, SE3, SE4 본문 파싱
- `src/modules/converter`: Markdown, frontmatter 렌더링
- `src/modules/exporter`: export workflow와 Image Upload/rewrite
- `src/server`: HTTP API, job 상태 관리
- `src/ui`: React 로컬 웹 UI
- `src/shared`: 타입, 옵션, block output 선택, job 상태
- `scripts/export-single-post.ts`: 단건 검증 CLI
- `scripts/harness/*`: parser/sample/UI 검증 harness
