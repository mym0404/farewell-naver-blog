# Validation

## 목적
패키지 스크립트, git hook, CI, task loop를 저장소 실제 동작 기준으로 정리한다.

## Source Of Truth
- 실제 검증 명령은 `package.json`, `scripts/harness/*`, `lefthook` 설정이 기준이다.

## 관련 코드
- [../../../package.json](../../../package.json)
- [../../../scripts/harness/check-doc-graph.ts](../../../scripts/harness/check-doc-graph.ts)
- [../../../scripts/harness/verify-sample-exports.ts](../../../scripts/harness/verify-sample-exports.ts)

## 검증 방법
- `pnpm docs:check`
- `pnpm check:quick`
- `pnpm check:full`

## Primary Commands
- `pnpm check:quick`: `typecheck + test:offline + docs:check + parser:check`
- `pnpm check:local`: 로컬 기본 검증
- `pnpm check:full`: quality report, 로컬 검증, network test, samples verify, UI smoke
- `pnpm check`: `check:full` alias

## Focused Commands
- `pnpm typecheck`: TypeScript 무출력 검사
- `pnpm test:offline`: 네트워크 없는 로컬 테스트
- `pnpm test:network`: 네트워크 필요한 통합 테스트
- `pnpm docs:check`: 문서 링크, 필수 섹션, generated freshness 검사
- `pnpm parser:check`: capability, fixture, 테스트, sample 대응 검사
- `pnpm samples:verify`: 실샘플 fetch -> parse -> render 검증
- `pnpm smoke:ui`: scan -> category select -> export 브라우저 smoke
- `pnpm quality:report`: generated 품질 리포트 갱신

## Hook And CI
- `prepare` 스크립트가 `lefthook install`을 실행한다.
- `pre-commit` hook은 `pnpm test:offline`을 돈다.
- `pre-push` hook은 `pnpm check:local`을 돈다.
- PR CI는 `pnpm check:full`을 기준으로 본다.

## Task Loops
- parser 변경: `pnpm check:quick`, 필요 시 `pnpm samples:verify`
- renderer/exporter 변경: `pnpm check:full`
- docs만 변경: `pnpm docs:check`, 필요 시 `pnpm quality:report`
- UI/API 변경: `pnpm smoke:ui`
