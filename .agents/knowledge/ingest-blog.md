# Ingest Blog

## Purpose
- The repo-local `ingest-blog` skill improves parser coverage from real public Naver Blog posts.
- It is a failure-driven parser coverage loop that discovers all parser gaps but implements and PRs one parser support unit at a time.
- The skill body lives at `.agents/skills/ingest-blog/SKILL.md`.

## Commands
```bash
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts --blogId <blogId>
```

```bash
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts \
  --blogId <blogId> \
  --reuseOutputDir tmp/harness/ingest-blog/<runId> \
  --rerunFailures \
  --focusSupportUnit naver-se4:v2_poll
```

```bash
bun .agents/skills/ingest-blog/scripts/write-sample-fixture.ts \
  --blogId <blogId> \
  --logNo <logNo> \
  --id se4-example-block
```

## Ingest Behavior
- Blog ingest uses `NaverBlogExporter` and forces remote asset references for the scan path.
- Image and thumbnail downloads stay disabled in the ingest scripts.
- A completed output for the same `blogId` can be reused when the manifest matches the blog and has `finishedAt`.
- When reusable output exists, rerun failed posts only unless `--forceFull` is explicitly requested.
- Previous successful posts are treated as stable during a failed-post rerun.
- Shared ingest output and aggregate run state stay under ignored `tmp/harness/ingest-blog/<runId>`.
- `.cache/` is app runtime state and is not used for ingest workflow state.
- `--focusSupportUnit <key>` makes report generation and exit status use only the selected parser support unit.

## Required Parser Coverage Outputs
- A real focused parser gap must be closed by adding a parser block or extending the owning block.
- Each fixed support unit needs one representative public sample fixture.
- Related knowledge changes are required when parser responsibility, fixture policy, output behavior, or verification expectations change.
- Unresolved focused failures are not fixed by adding placeholder fixtures or code. Report the reason, representative `logNo`, and inspect evidence instead.
- Other support units from the same blog stay as ignored backlog and do not appear in the focused PR body.

## Expected PR File Shape
- Before editing, infer whether the focused support unit is an existing-block edit or a new-block addition.
- Existing-block edits should normally touch the owning block file, its adjacent spec, one representative sample fixture, and durable knowledge only when the contract changed.
- New-block additions should normally add the block file, adjacent spec, owning editor registration, one representative sample fixture, and durable knowledge only when the contract changed.
- Committed `figure` evidence assets are allowed when report or PR evidence needs them.
- Renderer, exporter, shared AST types, UI, workflow, broad helpers, and unrelated knowledge stay out of the PR unless the focused failed HTML cannot fit existing contracts.
- If the necessary diff is wider than the expected file shape, the report should state why the wider change belongs to the focused support unit.

## Reports
- Every completed skill run writes `report.md`, `report.json`, and `evidence.md` under the ingest output directory.
- Full reports include ingest target, output reuse status, post counts, failed-post rerun result, parser changes, fixtures, knowledge updates, verification results, evidence, and unresolved failures.
- Focused reports include only the selected support unit, focused rerun result, parser changes, fixtures, knowledge updates, verification results, evidence, and unresolved focused failures.
- Evidence generation follows `.agents/knowledge/post-evidence.md`.
- Ingest report evidence uses the `figure` asset profile so PR/report images are stored in `.agents/knowledge/reference/assets/figure` instead of ignored `tmp` paths.
- Evidence capture errors make the report incomplete until fixed or explicitly explained.

## PR Policy
- Code, fixtures, knowledge, verification, and focused reports finish before PR handling.
- Invoking the repo-local `ingest-blog` skill is PR creation intent.
- Default behavior is to create a draft PR for the focused support unit without asking for confirmation.
- If the focused unit is safely deferred with no code or fixture changes, report the deferral instead of creating an empty PR.
- Before starting or creating a PR, fetch `origin/main` and inspect open/draft PR bodies for the same `<!-- ingest-blog:supportUnitKey=... -->` marker.
- The PR title starts with `[📦 New Block]` and uses Korean after the fixed prefix.
- The PR gets `ai-generated` and `failure-block:<failureBlockHash>` labels.
- The PR body starts with one or two Korean summary lines that state what parser behavior changed.
- The hidden support unit claim marker follows the Korean summary.
- After the summary and marker, the visible PR body uses exactly three top-level sections: `# New Block Parser Arrival`, `# Evidence`, and `# Original Html`.
- `# New Block Parser Arrival` contains only `Blog`, `Editor`, `Parser Block`, and `Original Post` rows.
- `# Evidence` contains the raw-GitHub evidence image and rendered Markdown evidence.
- `# Original Html` contains the HTML that failed before the parser change in an `html` code fence.
- The PR body must not include visible root cause, changes, validation, notes, report, backlog, full-blog counts, or other support unit sections.
- Keep the hidden support unit claim marker as an HTML comment for duplicate checks.
- PR evidence images use committed `figure` assets and `https://raw.githubusercontent.com/<owner>/<repo>/<headCommitSha>/<path>` URLs after push.
- PR evidence images must not use `tmp/`, `file://`, `.agents/...` relative paths, or paths that only render locally.

## Coverage Target
- Use a public blog with unsupported parser blocks as the coverage target.
- Blogs with no unsupported parser blocks can check basic script health but are not parser coverage targets.
- Completion means every discovered `supportUnitKey` has its own focused branch or PR and the merged aggregate target has manifest `failureCount` `0`, empty failure groups, and no downloaded image files.

## Verification
- Validate the skill with the skill-creator `quick_validate.py` script against `.agents/skills/ingest-blog`.
- Check CLI surfaces with `bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts --help` and `bun .agents/skills/ingest-blog/scripts/write-sample-fixture.ts --help`.
- Use `bun scripts/capture-post-evidence.ts --help` for evidence CLI changes.
- Parser block changes need `pnpm test:parser-blocks` and `pnpm test:offline`.
- Broader parser, renderer, exporter, or UI state changes may require `pnpm check:local` or `pnpm check:full` according to `.agents/knowledge/verification.md`.
