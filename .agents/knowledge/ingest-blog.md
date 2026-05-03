# Ingest Blog

## Purpose
- The repo-local `ingest-blog` skill improves parser coverage from real public Naver Blog posts.
- It is a failure-driven parser coverage loop, not a report-only scan.
- The skill body lives at `.agents/skills/ingest-blog/SKILL.md`.

## Commands
```bash
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts --blogId mym0404
```

```bash
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts \
  --blogId mym0404 \
  --reuseOutputDir tmp/harness/ingest-blog/mym0404 \
  --rerunFailures
```

```bash
bun .agents/skills/ingest-blog/scripts/write-sample-fixture.ts \
  --blogId mym0404 \
  --logNo 223034929697 \
  --id se4-example-block
```

## Ingest Behavior
- Blog ingest uses `NaverBlogExporter` and forces remote asset references for the scan path.
- Image and thumbnail downloads stay disabled in the ingest scripts.
- A completed output for the same `blogId` can be reused when the manifest matches the blog and has `finishedAt`.
- When reusable output exists, rerun failed posts only unless `--forceFull` is explicitly requested.
- Previous successful posts are treated as stable during a failed-post rerun.

## Required Parser Coverage Outputs
- A real parser gap must be closed by adding a parser block or extending the owning block.
- Each fixed failure type needs one representative public sample fixture.
- Related knowledge changes are required when parser responsibility, fixture policy, output behavior, or verification expectations change.
- Unresolved failures are not fixed by adding placeholder fixtures or code. Report the reason, representative `logNo`, and inspect evidence instead.

## Reports
- Every completed skill run writes `report.md`, `report.json`, and `evidence-table.md` under the ingest output directory.
- Reports include ingest target, output reuse status, post counts, failed-post rerun result, parser changes, fixtures, knowledge updates, verification results, evidence table, and unresolved failures.
- Evidence table generation follows `.agents/knowledge/post-evidence.md`.
- Ingest report evidence uses the `figure` asset profile so PR/report images are stored in `.agents/knowledge/reference/assets/figure` instead of ignored `tmp` paths.
- Evidence capture errors make the report incomplete until fixed or explicitly explained.

## PR Policy
- Code, fixtures, knowledge, verification, and reports finish before PR handling.
- Default behavior is to ask after the report is ready.
- Commit, push, or PR creation still requires explicit user intent.
- A requested PR body should include the report summary and evidence table.

## Baseline Blog
- `mym0404` is the script-health baseline for the skill.
- Completion means full ingest succeeds, manifest `failureCount` is `0`, failure groups are empty, and no image files are downloaded.
- `mym0404` is not expected to discover a new parser block.
- If `mym0404` fails, check the script first and apply parser coverage work only for a real parser gap.

## Verification
- Validate the skill with the skill-creator `quick_validate.py` script against `.agents/skills/ingest-blog`.
- Check CLI surfaces with `bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts --help` and `bun .agents/skills/ingest-blog/scripts/write-sample-fixture.ts --help`.
- Use `bun scripts/capture-post-evidence.ts --help` for evidence table CLI changes.
- Parser block changes need `pnpm test:parser-blocks` and `pnpm test:offline`.
- Broader parser, renderer, exporter, or UI state changes may require `pnpm check:local` or `pnpm check:full` according to `.agents/knowledge/verification.md`.
