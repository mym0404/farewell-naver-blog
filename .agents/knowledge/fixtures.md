# Sample Fixtures

## Source Of Truth
- Sample fixture directories live under `tests/fixtures/samples/*`.
- Each sample must contain either `expected.md` or `expected-error.md`.
- `tests/helpers/sample-fixtures.spec.ts` discovers directories dynamically.
- `tests/helpers/sample-fixtures.ts` parses expected frontmatter, fetches the live Naver post HTML from `blogId` and `logNo`, and renders it with fixture export options.
- Live sample HTML is cached under `tmp/harness/sample-post-html-cache` through the optional `NaverBlogFetcher` cache interface.

## Fixture Options
- Sample fixture rendering uses `defaultExportOptions()`.
- Fixture rendering sets asset handling to remote references.
- Fixture rendering disables image and thumbnail downloads.
- Fixture rendering disables `exportedAt` frontmatter so expected Markdown stays stable.

## Current Samples
- `se2-code-image-autolayout`
- `se2-legacy`
- `se2-table-rawhtml-navigation`
- `se2-thumburl-image-group`
- `se3-legacy`
- `se3-quote-imagegroup-note9`
- `se3-quote-table-vita`
- `se4-formula-code-linkcard`
- `se4-heading-itinerary`
- `se4-image-group`
- `se4-image-legacy-link`
- `se4-quote-formula-code`
- `se4-text-lists-nestjs`
- `se4-video-table`

## Operating Rules
- Add or update the expected output file for each sample.
- `expected.md` and `expected-error.md` must start with YAML frontmatter containing title, source, blogId, logNo, publishedAt, category, and categoryPath.
- `expected-error.md` must include an `error` frontmatter string.
- Fixture ids should describe editor and dominant block coverage.
- A parser block without a public sample should be covered by focused parser tests until a durable sample exists.
- Parser block, renderer, or export option changes that alter Markdown output or parser failure behavior must update the affected expected files intentionally.

## Verification
- `pnpm test:offline`: runs sample fixture live-fetch regression with the rest of the Vitest suite.
- `pnpm check:local`: includes typecheck and sample fixture live-fetch regression.
