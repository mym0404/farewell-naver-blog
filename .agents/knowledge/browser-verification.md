# Browser Verification

## When To Use
- Use browser validation when the user asks to inspect UI behavior or when a meaningful UI change affects visible flow, layout, controls, or feedback.
- Automated checks are still `pnpm smoke:ui` and `pnpm test:network`; this document is for targeted manual browser confirmation.

## Server Rules
- Do not reuse a user's `pnpm dev` session for agent harness checks.
- Start isolated checks with non-default `PORT`, separate `GOODBYE_SETTINGS_PATH`, and separate `GOODBYE_SCAN_CACHE_PATH`.
- Keep browser verification scratch files under repo-local `tmp/`.
- Prefer harnesses that use `listen(0)` when available.

## What To Check
- Requested buttons, inputs, dialogs, filters, tables, progress, and upload state actually work on screen.
- UI state matches API response or `manifest.json` state.
- Export reaches `completed` or `upload-ready` as expected.
- Upload reaches `upload-completed`, `upload-failed`, or the requested intermediate state.
- Desktop/mobile layout has no obvious horizontal overflow, clipping, or unreadable contrast.

## Record
- URL and viewport.
- Input values.
- Final job status.
- Success or failure signal.
- Failure details from screen, API state, and manifest state when relevant.
