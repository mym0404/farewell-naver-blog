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

Run full ingest with remote asset references:

```bash
bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts --blogId mym0404
```

Create a fixture for one fixed representative post:

```bash
bun .agents/skills/ingest-blog/scripts/write-sample-fixture.ts \
  --blogId mym0404 \
  --logNo 223034929697 \
  --id se4-example-block
```

Both scripts force image handling to remote references and disable image and thumbnail downloads.

## Workflow

1. Run `collect-blog-errors.ts --blogId <blogId>`.
2. Read the generated `manifest.json`, `failure-summary.json`, `failure-summary.md`, and per-post inspect reports.
3. Group failures by root parser cause, not by title or category.
4. For each actual parser gap, inspect the failed HTML and identify the owning editor/block boundary.
5. Implement the smallest parser block addition or extension that handles that DOM shape.
6. Add or extend the focused parser block spec beside the block implementation.
7. Add one representative sample fixture per fixed failure type with `write-sample-fixture.ts`.
8. Update knowledge documents only where a durable rule changed.
9. Run the verification commands listed below.

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
