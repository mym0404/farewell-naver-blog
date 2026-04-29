# Sample Fixtures

## Source Of Truth
- Sample fixture directories live under `tests/fixtures/samples/*`.
- Each sample must contain `source.html` and `expected.md`.
- `tests/sample-fixtures.test.ts` discovers directories dynamically.
- `scripts/harness/lib/sample-fixtures.ts` parses `expected.md` frontmatter and renders `source.html` with fixture export options.

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
- `se4-video-table`

## Operating Rules
- Add or update `source.html` and `expected.md` together.
- `expected.md` must start with YAML frontmatter containing title, source, blogId, logNo, publishedAt, category, and categoryPath.
- Fixture ids should describe editor and dominant block coverage.
- A parser block without a public sample should be covered by focused parser tests until a durable sample exists.
- Parser block, renderer, or export option changes that alter Markdown output must update the affected `expected.md` files intentionally.

## Verification
- `pnpm test:offline`: runs sample fixture regression with the rest of the offline suite.
- `pnpm check:local`: includes typecheck and offline fixture regression.
