# Verification

## Source Of Truth
- Package scripts live in `package.json`.
- CI lives in `.github/workflows/required-checks.yml`.
- UI and live harnesses live in `scripts/harness/*`.
- Sample fixture regression lives in `tests/sample-fixtures.test.ts` and `scripts/harness/lib/sample-fixtures.ts`.

## Primary Commands
- `pnpm check:local`: `pnpm typecheck && pnpm test:offline`. Run after ordinary repository file changes.
- `pnpm check:full`: `pnpm typecheck && pnpm test:offline && pnpm smoke:ui`. Run when user flow, UI state, exporter output, or shared runtime behavior may be affected.
- `pnpm smoke:ui`: `pnpm build:ui && node --import tsx ./scripts/harness/run-ui-smoke-suite.ts`. Verifies mock-based scan, export, upload, theme persistence, and resume UI.
- `pnpm test:network`: builds UI once, then runs live resume export, SE2 table resume export, and live upload e2e. It needs external network and upload credentials and creates remote state.
- `pnpm test:coverage`: runs Vitest with V8 coverage.

## Focused Commands
- `pnpm typecheck`: TypeScript contract check only.
- `pnpm test:offline`: Vitest offline suite, including sample fixture regression.
- `pnpm test:network:resume-export`: live Naver resume export without upload.
- `pnpm test:network:resume-export:se2-table`: live SE2 table resume export range.
- `pnpm test:network:upload`: live browser UI export and GitHub upload through PicList runtime.
- `pnpm dev`: user-facing HMR server on the default development port. Harnesses should not reuse it.
- `pnpm start`: builds UI and serves `dist/client` through `src/Server.ts`.

## Coverage And Blind Spots
- `pnpm test:offline` does not prove live Naver HTML still matches saved fixture reality.
- Sample fixtures prove current code matches saved `source.html -> expected.md`; they do not prove every parser block has a real public sample.
- `pnpm smoke:ui` uses mock flows and does not prove live Naver fetch or external upload behavior.
- `pnpm test:network:resume-export` proves live fetch and resume export, but not external upload.
- `pnpm test:network:upload` is the only bundled command that proves external upload state. It creates remote state.
- Fork PRs may not receive `FAREWELL_UPLOAD_E2E_GITHUB_TOKEN`, so CI live upload can fail for secret availability rather than code behavior.

## CI
- `.github/workflows/required-checks.yml` runs on non-draft pull requests.
- CI uses Node.js 20 and pnpm 10.
- CI runs `pnpm check:full`, writes `.env` with `FAREWELL_UPLOAD_E2E=1`, runs `pnpm test:network:upload`, runs `pnpm test:coverage`, then uploads `coverage/lcov.info` to Codecov.

## Task Loops
- Knowledge-only changes still need path and command spot checks. Run `pnpm check:local` when practical.
- Parser block or sample fixture changes need `pnpm test:offline` at minimum.
- Exporter, renderer, manifest, upload, resume, or UI state changes need `pnpm smoke:ui`.
- Live resume or upload changes need the matching `pnpm test:network:*` command.
- If a command fails, compare the failure to the current diff before changing code. Report unrelated existing failures without calling them pass.
