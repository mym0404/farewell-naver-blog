# Code Style And Workflow

## Repo-Specific Priorities
- Prefer current code, tests, and package scripts over stale docs.
- Keep runtime code in `src/`. Fixture lists, coverage reports, harness metadata, and generated evidence stay outside runtime code.
- Parser, renderer, exporter, server, and UI contracts should stay visible in code or tests when they are mechanical.
- Commit, push, and PR creation require explicit user request.

## TypeScript
- The repo is strict TypeScript with NodeNext ESM.
- Use `.js` extensions in TS imports where NodeNext runtime imports require them.
- Reuse shared types from `src/shared/*` when crossing module or server/UI boundaries.
- Keep parser block types and output families aligned with `src/modules/blog/BlogRegistry.ts` and `src/shared/BlockRegistry.ts`.

## UI Code
- `src/ui/components/ui/*` is the shadcn primitive layer. Prefer feature composition, tokens, or helper classes before changing primitives.
- Use `@shared/*` and `@/*` aliases configured in `vite.config.ts` and `tsconfig.json`.
- UI tests should prefer user behavior, accessibility state, API contract, and visible text over className or computed-style assertions.
- Do not add native `<select>` for new dropdowns; use the existing shadcn `Select`.
- Do not mix icon sets; use `@remixicon/react`.

## Server And Harness
- User `pnpm dev` owns the normal development server path.
- Tests and harnesses should use isolated `FAREWELL_SETTINGS_PATH`, `FAREWELL_SCAN_CACHE_PATH`, and non-default `PORT` or `listen(0)`.
- Ad-hoc server checks should not share `.cache/export-ui-settings.json` with the user's development session.

## Documentation
- Evergreen repo knowledge lives in shallow `.agents/knowledge/*.md` files.
- `AGENTS.md` is the only router.
- Keep old/new narration, task logs, and cleanup history out of evergreen docs unless they describe a current operating constraint.
- Update relevant knowledge when parser block, sample fixture, renderer/exporter, upload/resume, or UI design contracts change.
