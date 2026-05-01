# Agent Guide

## Project Overview
- 이 저장소는 공개 네이버 블로그 글을 수집해 editor별 parser block으로 공용 AST를 만들고, Markdown, frontmatter, 자산 파일, `manifest.json`으로 export하는 로컬 도구다.
- 로컬 웹 UI, 단건 export CLI, fixture-first regression, Playwright UI smoke, live network e2e를 함께 유지한다.

## Tech Stack
- `pnpm` 단일 저장소에서 Node.js 24 LTS, Node.js ESM, TypeScript, Bun 기반 TS 실행을 사용한다.
- 웹 UI는 React, Vite, Tailwind CSS v4, shadcn/Radix, Sonner로 구성된다.
- 검증은 Vitest, Playwright, `scripts/harness/*`가 맡는다.

## Runtime And Architecture
- 서버 시작점은 `src/Server.ts`, HTTP API는 `src/server/HttpServer.ts`다.
- export 파이프라인은 `src/modules/exporter/NaverBlogExporter.ts`에서 `fetch -> parse -> review -> render -> write -> manifest` 순서로 따라간다.
- parser seam은 `src/modules/parser/PostParser.ts`, `src/modules/blog/*`, `src/modules/editor/*`, `src/modules/blocks/*`, `src/shared/BlockRegistry.ts`다.
- UI 셸은 `src/ui/App.tsx`, 공용 shell/hook/status는 `src/ui/features/common/*`, 전역 토큰은 `src/ui/styles/globals.css`다.

## Design System
- UI 기준은 `.agents/knowledge/DESIGN.md`다.
- theme/token source of truth는 `src/ui/styles/globals.css`, primitive layer는 `src/ui/components/ui/*`다.
- dark-first single-column wizard, shadcn primitive 우선, 아이콘은 `@remixicon/react`만 유지한다.

## Operating Rules
- source of truth 우선순위는 사용자 지시, 루트 `AGENTS.md`, 코드/설정/테스트, `.agents/knowledge/*.md`, reference 문서다.
- 영속 UI 설정과 서버 파일 캐시는 `.cache/` 아래에 저장한다. 작업 산출물 폴더에는 runtime 산출물만 둔다.
- AI agent, test, harness가 서버를 띄울 때는 사용자 `pnpm dev`와 공유 `.cache/export-ui-settings.json`을 피하고, 별도 `FAREWELL_SETTINGS_PATH`, `FAREWELL_SCAN_CACHE_PATH`, 비기본 `PORT` 또는 `listen(0)`을 쓴다.
- parser block, sample fixture, renderer/exporter 계약이 바뀌면 관련 knowledge를 함께 갱신한다.
- commit, push, PR 생성은 사용자가 명시적으로 요청한 경우에만 수행한다.

## Validation Routes
- `pnpm check:local`: 저장소 파일 변경 뒤 기본 기준선이다. `typecheck`, offline tests를 실행한다.
- `pnpm check:full`: `check:local`에 Playwright smoke UI를 더한 넓은 로컬 회귀다.
- `pnpm smoke:ui`: mock 기반 UI 흐름과 복구 경로를 확인한다. 코어 사용자 흐름이나 상태 전이를 바꾼 뒤 실행한다.
- `pnpm test:network`: live resume export, SE2 table resume export, live upload e2e를 순서대로 실행한다. 외부 네트워크와 upload secret이 필요하고 remote state를 만든다.
- 검증 명령이 실패하면 현재 작업이 만든 회귀인지 먼저 본다. 현재 작업 때문이면 고치고, 기존 상태나 다른 변경 때문이면 실패 명령과 영향 범위를 보고한다.

## Knowledge Router
- Architecture: `.agents/knowledge/architecture.md`
- Verification: `.agents/knowledge/verification.md`
- Product domain and output rules: `.agents/knowledge/domain.md`
- Sample fixtures: `.agents/knowledge/fixtures.md`
- Upload and resume lifecycle: `.agents/knowledge/upload.md`
- UI design system: `.agents/knowledge/DESIGN.md`
- Code style and local workflow: `.agents/knowledge/code-style.md`
