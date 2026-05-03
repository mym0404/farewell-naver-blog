---
name: ingest-blog
description: Ingest a public Naver Blog by blogId to improve this repository's parser coverage. Use when Codex needs to export every public post without downloading images, summarize parse failures, implement or extend parser blocks for failed HTML, add representative sample fixtures, update related project knowledge, and create Korean draft PRs.
---

# Ingest Blog

Use this skill to raise Naver Blog parser coverage from real public posts. Treat a blog ingest as a coverage-improvement loop that discovers all gaps but implements and PRs one parser support unit at a time.

## Required Outcome

When a parse error is found, group failures into parser support units and work on one `supportUnitKey` per branch or PR. For the focused support unit, the final work must include all three outputs:

- Add a new parser block or extend the existing block that owns the failed HTML.
- Add a representative sample fixture for the fixed failure type.
- Update related knowledge documents when responsibilities, behavior, fixture rules, or verification expectations changed.

Do not treat an unresolved focused support unit as complete. If a failure cannot be safely fixed in the current pass, leave code and fixtures unchanged for that unit and report the reason, representative `logNo`, and inspect evidence.
Other support units from the same blog stay as backlog in ignored `tmp` run state and must not appear in the focused PR body.

## Quick Commands

Run ingest with remote asset references. If a completed output for the same `blogId` exists, reuse it and rerun only failed posts:

```bash
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts --blogId <blogId>
```

Force a new full ingest:

```bash
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts --blogId <blogId> --forceFull
```

Reuse a specific completed output and rerun only failed posts:

```bash
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts \
  --blogId <blogId> \
  --reuseOutputDir tmp/harness/ingest-blog/<runId> \
  --rerunFailures
```

Rerun and report one parser support unit:

```bash
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts \
  --blogId <blogId> \
  --reuseOutputDir tmp/harness/ingest-blog/<runId> \
  --rerunFailures \
  --focusSupportUnit <supportUnitKey>
```

Create a fixture for one fixed representative post:

```bash
bun .agents/skills/ingest-blog/scripts/write-sample-fixture.ts \
  --blogId <blogId> \
  --logNo <logNo> \
  --id <fixtureId>
```

`collect-blog-errors.ts` and `write-sample-fixture.ts` force image handling to remote references and disable image and thumbnail downloads.

Create evidence for a source post or inspect path:

```bash
bun scripts/capture-post-evidence.ts \
  --blogId <blogId> \
  --logNo <logNo> \
  --target inspect-path \
  --inspectPath 0 \
  --metadataCachePath tmp/harness/post-evidence/metadata-cache.json
```

`--target post` renders Markdown with frontmatter. `--target inspect-path` renders only the selected block fragment and omits frontmatter.
Naver screenshots capture the selected HTML node rather than the current viewport; long nodes may produce tall images.
Evidence renders as README-style Markdown sections with a source link, Naver capture image, and Markdown code fence.
Use `--metadataCachePath` when generating multiple rows from one blog so post metadata scan results are reused.
Use `--assetProfile tmp` for local smoke output, `--assetProfile readme` for README assets, and `--assetProfile figure` for report or PR figures that must be committed.

## Workflow

1. Run `collect-blog-errors.ts --blogId <blogId>` unless the user explicitly asked for `--forceFull`.
2. If the script reuses a completed output, treat previous successes as stable and rerun only the failed posts.
3. Read the generated `manifest.json`, `failure-summary.json`, `failure-summary.md`, `report.json`, `report.md`, `evidence.md`, and per-post inspect reports.
4. Select one `supportUnitKey` from `failureGroups`; do not implement multiple support units in the same branch or PR.
5. Before starting that unit, run `git fetch origin main` and inspect open/draft PRs with `gh pr list --state open --json number,title,body,headRefName,isDraft`.
6. Skip the unit if `origin/main` already supports it or an open/draft PR body contains the same `<!-- ingest-blog:supportUnitKey=... -->` marker.
7. Inspect the focused failed HTML and identify the owning editor/block boundary.
8. Infer the expected PR file shape before editing. Use the owning editor/block boundary to decide whether this should be an existing-block edit or a new-block addition.
9. Implement the smallest parser block addition or extension that handles that DOM shape.
10. Add or extend the focused parser block spec beside the block implementation.
11. Add one representative sample fixture for the focused support unit with `write-sample-fixture.ts`.
12. Update knowledge documents only where a durable rule changed.
13. Run the verification commands listed below.
14. Regenerate the report with `--focusSupportUnit <key>` so it reflects only the focused unit, fixtures, knowledge updates, verification results, and evidence.

Do not rerun the same blog as a full ingest after a completed output exists unless the user asked for `--forceFull` or the reusable manifest is invalid.
Store shared ingest output and aggregate run state only under ignored `tmp/harness/ingest-blog/<runId>`. Do not use `.cache` for this workflow because it is reserved for app runtime state.

## Report Rules

Every completed skill run must leave these report artifacts:

- `report.md`
- `report.json`
- `evidence.md`
- evidence images under `.agents/knowledge/reference/assets/figure`

The report must include:

- ingest target and whether an output was reused
- total post count and failed post count
- failed-post rerun results
- parser support added or extended
- fixtures added
- knowledge documents updated
- verification commands and results
- evidence generated through `scripts/capture-post-evidence.ts` helpers
- unresolved focused failures and the reason each one is deferred

Keep evidence metadata as a short human note, such as the parser block behavior being demonstrated. Do not fill it with routine run state like blog id, log number, title, or status unless that value is the useful note for the section.

Use `--changesPath <json>` when rerunning the collector after code changes. The JSON may contain `parserChanges`, `fixtures`, `knowledge`, `verification`, and `unresolved` arrays.
If unresolved focused failures remain, include one deferred reason per representative failure group in `unresolved`.
Treat non-zero evidence capture errors as an incomplete report and fix the evidence generation issue before using the report.

## PR Flow

An `ingest-blog` invocation is PR creation intent. After code, fixtures, knowledge updates, verification, and focused reports are ready, create a draft PR for the focused support unit without asking for confirmation.
Do not offer `pr=ask`, `pr=none`, or other PR modes.
If there are no code or fixture changes for the focused support unit because it is safely deferred, do not create an empty PR; report the deferral instead.

The PR body must start with one or two Korean summary lines that state what parser behavior changed. Keep the summary concrete and visible before the hidden claim marker and sections.
After the summary and hidden claim marker, the visible PR body must use exactly these three top-level sections and no extra visible sections:

````markdown
<Korean summary of what changed>
<Optional second Korean summary line for fixture or verification context>

<!-- ingest-blog:supportUnitKey=<key> -->

# Parser Support

- Blog: `<blogId>`
- Editor: `<editorType>`
- Parser Support: `<ParserSupportName>`
- [Original Post](<sourceUrl>)

# Evidence

<raw-GitHub evidence image and rendered Markdown evidence>

# Original Html

```html
<HTML that failed before the parser change>
```
````

Do not add visible root cause, changes, validation, notes, report, backlog, full-blog sections, or other extra visible sections to the PR body.
Keep the hidden claim marker as an HTML comment if needed for duplicate checks, but do not add another visible section for it.
For a focused support-unit PR:

- Title must start with `[Parser Support]`.
- Add or create GitHub labels `ai-generated` and `failure-block:<failureBlockHash>`.
- Include only the summary and fixed three-section body above.
- Include a hidden claim marker after the summary: `<!-- ingest-blog:supportUnitKey=<key> -->`.
- Re-run the open/draft PR duplicate check immediately before creating the PR.
- PR evidence images must render on GitHub. Commit `figure` assets first, push the branch, then replace local or repo-relative image paths with `https://raw.githubusercontent.com/<owner>/<repo>/<headCommitSha>/<path>` URLs in the PR body.
- Do not use `tmp/`, `file://`, `.agents/...` relative paths, or Markdown/HTML image paths that only work locally in the PR body.

When one skill invocation creates multiple PRs, use one branch and worktree per support unit. Use `.worktrees/ingest-blog/<supportUnitKey>/`, and add `.worktrees/` to `.gitignore` if it is missing.

## Parser Fix Rules

- Keep changes scoped to the editor family that produced the failure.
- Prefer extending an existing block when the DOM is the same content family.
- Add a new block only when the HTML has a distinct responsibility.
- Register a new block directly in the editor `supportedBlocks` list.
- Do not add a registry, compatibility re-export, broad fallback parser, or catch-all block.
- Do not change renderer or AST types unless the failed content cannot fit an existing AST block.
- If a new AST block type is unavoidable, update shared types, renderer, exporter behavior, focused tests, fixtures, and knowledge together.
- Keep the PR file shape predictable from the chosen strategy:
  - Existing-block edit: touch the owning block file, its adjacent spec, one representative sample fixture, and durable knowledge only if the contract changed.
  - New-block addition: add the new block file, its adjacent spec, the owning editor registration, one representative sample fixture, and durable knowledge only if the contract changed.
  - Evidence assets may be included when the report or PR body needs committed `figure` images.
- Do not touch renderer, exporter, shared AST types, UI, workflow, broad helpers, or unrelated knowledge unless the focused failed HTML cannot be represented through existing contracts.
- If the necessary diff does not match the expected file shape, keep the wider change directly tied to the focused failure and document the reason in the report.

## Fixture Rules

- Add one public sample fixture per fixed failure type.
- Use fixture ids that describe the editor and dominant block behavior.
- Write `expected.md` for fixed behavior.
- Do not add `expected-error.md` for unresolved failures.
- Do not store source HTML in the fixture directory.
- Keep live HTML input through the existing sample fixture harness and cache.

## Knowledge Updates

Update these files when their durable contract changes:

- `.agents/knowledge/parser-blocks.md`: parser block responsibility, failure policy, container/leaf behavior, or output option contract.
- `.agents/knowledge/parser-architecture.md`: routing, file placement, AST boundary, or editor/block ownership.
- `.agents/knowledge/editor-se2.md`: SE2 parsing strategy or supported behavior category.
- `.agents/knowledge/editor-se3.md`: SE3 parsing strategy or supported behavior category.
- `.agents/knowledge/editor-se4.md`: SE4 module-context handling, fallback strategy, or supported behavior category.
- `.agents/knowledge/fixtures.md`: fixture rules, expected output policy, or sample harness behavior.
- `.agents/knowledge/verification.md`: required commands or parser change verification rules.
- `.agents/knowledge/domain.md`: Markdown, frontmatter, asset, or output domain rules.

Do not update knowledge only to list a new fixture id, exact block key, selector, or sample inventory item.

## Verification

For skill changes:

```bash
python3 /Users/mj/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/ingest-blog
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts --help
bun .agents/skills/ingest-blog/scripts/write-sample-fixture.ts --help
bun scripts/capture-post-evidence.ts --help
```

For parser/block changes:

```bash
pnpm test:parser-blocks
pnpm test:offline
pnpm check:local
```

Run `pnpm check:unused` when moving, exporting, removing, or intentionally keeping source/test/script code that may be unused.

## Coverage Target

Use a public blog that actually has unsupported parser blocks as the coverage target. A blog with no unsupported blocks can check basic script health, but it cannot prove this parser coverage workflow.

For a selected coverage target, completion means every discovered `supportUnitKey` has been handled through its own focused branch or PR. After those focused changes are merged, rerun a full ingest of the same target on `origin/main`; the aggregate pass is complete only when the generated manifest has `failureCount: 0`, failure groups are empty, and no image files are downloaded.
