---
name: ingest-blog
description: Ingest a public Naver Blog by blogId to improve this repository's parser coverage. Use when Codex needs to export every public post without downloading images, summarize parse failures, implement or extend parser blocks for failed HTML, add representative sample fixtures, and update related project knowledge.
---

# Ingest Blog

Use this skill to raise Naver Blog parser coverage from real public posts. Treat a blog ingest as a coverage-improvement loop, not just a report.

## Required Outcome

When a parse error is found, the final work must include all three outputs:

- Add a new parser block or extend the existing block that owns the failed HTML.
- Add a representative sample fixture for the fixed failure type.
- Update related knowledge documents when responsibilities, behavior, fixture rules, or verification expectations changed.

Do not treat an unresolved parse error as complete. If a failure cannot be safely fixed in the current pass, leave code and fixtures unchanged for that failure and report the reason, representative `logNo`, and inspect evidence.

## Quick Commands

Run ingest with remote asset references. If a completed output for the same `blogId` exists, reuse it and rerun only failed posts:

```bash
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts --blogId mym0404
```

Force a new full ingest:

```bash
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts --blogId mym0404 --forceFull
```

Reuse a specific completed output and rerun only failed posts:

```bash
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts \
  --blogId mym0404 \
  --reuseOutputDir tmp/harness/ingest-blog/mym0404 \
  --rerunFailures
```

Create a fixture for one fixed representative post:

```bash
bun .agents/skills/ingest-blog/scripts/write-sample-fixture.ts \
  --blogId mym0404 \
  --logNo 223034929697 \
  --id se4-example-block
```

`collect-blog-errors.ts` and `write-sample-fixture.ts` force image handling to remote references and disable image and thumbnail downloads.

Create evidence for a source post or inspect path:

```bash
bun scripts/capture-post-evidence.ts \
  --blogId mym0404 \
  --logNo 223034929697 \
  --target inspect-path \
  --inspectPath 0
```

`--target post` renders Markdown with frontmatter. `--target inspect-path` renders only the selected block fragment and omits frontmatter.
Both Naver and renderer screenshots capture the selected HTML node rather than the current viewport; long nodes may produce tall images.
Renderer screenshots are captured in the external renderer's dark theme.
Use `--assetProfile tmp` for local smoke output, `--assetProfile readme` for README assets, and `--assetProfile figure` for report or PR figures that must be committed.

## Workflow

1. Run `collect-blog-errors.ts --blogId <blogId>` unless the user explicitly asked for `--forceFull`.
2. If the script reuses a completed output, treat previous successes as stable and rerun only the failed posts.
3. Read the generated `manifest.json`, `failure-summary.json`, `failure-summary.md`, `report.json`, `report.md`, `evidence-table.md`, and per-post inspect reports.
4. Group failures by root parser cause, not by title or category.
5. For each actual parser gap, inspect the failed HTML and identify the owning editor/block boundary.
6. Implement the smallest parser block addition or extension that handles that DOM shape.
7. Add or extend the focused parser block spec beside the block implementation.
8. Add one representative sample fixture per fixed failure type with `write-sample-fixture.ts`.
9. Update knowledge documents only where a durable rule changed.
10. Run the verification commands listed below.
11. Regenerate the report so it reflects the final parser changes, fixtures, knowledge updates, verification results, and evidence table.

Do not rerun the same blog as a full ingest after a completed output exists unless the user asked for `--forceFull` or the reusable manifest is invalid.

## Report Rules

Every completed skill run must leave these report artifacts:

- `report.md`
- `report.json`
- `evidence-table.md`
- evidence images under `.agents/knowledge/reference/assets/figure`

The report must include:

- ingest target and whether an output was reused
- total post count and failed post count
- failed-post rerun results
- parser blocks added or extended
- fixtures added
- knowledge documents updated
- verification commands and results
- evidence table generated through `scripts/capture-post-evidence.ts` helpers
- unresolved failures and the reason each one is deferred

Keep the evidence table `Metadata` column as a short human note, such as the parser block behavior being demonstrated. Do not fill it with routine run state like blog id, log number, title, or status unless that value is the useful note for the row.

Use `--changesPath <json>` when rerunning the collector after code changes. The JSON may contain `parserChanges`, `fixtures`, `knowledge`, `verification`, and `unresolved` arrays.
If unresolved failures remain, include one deferred reason per representative failure group in `unresolved`.
Treat non-zero evidence capture errors as an incomplete report and fix the evidence generation issue before using the report.

## PR Flow

Default behavior is `pr=ask`: finish code, fixtures, knowledge updates, verification, and reports first, then ask the user whether to open a PR.

- `pr=none`: do not ask and do not create a PR.
- `pr=ask`: ask after the final report is ready.
- `pr=draft`: commit, push, and create a draft PR only when the user explicitly invoked the skill with that intent.

This PR mode is an instruction to the agent running the skill, not a `collect-blog-errors.ts` CLI option.
Do not commit, push, or create a PR only because report generation finished. Keep the repository-level rule that commit/push/PR require explicit user instruction.

When a PR is requested, include the `report.md` summary and `evidence-table.md` content in the PR body.

## Parser Fix Rules

- Keep changes scoped to the editor family that produced the failure.
- Prefer extending an existing block when the DOM is the same content family.
- Add a new block only when the HTML has a distinct responsibility.
- Register a new block directly in the editor `supportedBlocks` list.
- Do not add a registry, compatibility re-export, broad fallback parser, or catch-all block.
- Do not change renderer or AST types unless the failed content cannot fit an existing AST block.
- If a new AST block type is unavoidable, update shared types, renderer, exporter behavior, focused tests, fixtures, and knowledge together.

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
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts --blogId mym0404
```

For parser/block changes:

```bash
pnpm test:parser-blocks
pnpm test:offline
pnpm check:local
```

Run `pnpm check:unused` when moving, exporting, removing, or intentionally keeping source/test/script code that may be unused.

## Completion Gate

The skill setup is complete only when `mym0404` full ingest succeeds, the generated manifest has `failureCount: 0`, the failure groups are empty, and no image files are downloaded.

Use `mym0404` as the script-health baseline. It is not expected to require a new parser block or fixture. If `mym0404` produces a parse failure, first check whether the script is wrong; only apply the parser coverage workflow if the failure is a real parser gap.
