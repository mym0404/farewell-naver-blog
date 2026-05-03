# Single Post Verification

## Purpose
- Use this path to compare one public Naver Blog post against the single-post export CLI and manual browser observation.

## Export Command
```bash
bun scripts/export-single-post.ts \
  --blogId mym0404 \
  --logNo 223034929697 \
  --outputDir tmp/manual-audit/223034929697/output \
  --report tmp/manual-audit/223034929697/report.json \
  --manualReviewMarkdownPath tmp/manual-audit/223034929697/post.md \
  --metadataCachePath tmp/manual-audit/223034929697/metadata-cache.json
```

## Inspect Command
```bash
bun scripts/export-single-post.ts \
  --inspect \
  --blogId mym0404 \
  --logNo 223034929697 \
  --report tmp/manual-audit/223034929697/inspect.json
```

- Use inspect before implementing a parser block when the export error only names an unsupported editor node.
- Inspect mode fetches the post HTML, detects the editor, attempts parsing, and reports unsupported nodes with DOM path, tag, class, SE4 module type, text, and HTML snippet.
- Inspect mode does not require `--outputDir` and does not write Markdown, assets, or export folders.
- Add `--stdout` to emit the full inspect JSON to stdout. Without `--stdout`, the command prints a concise summary and writes full JSON only when `--report` is provided.

## Manual Loop
- Open the public post in a browser.
- Record visible editor version clues, block types, and unusual structure.
- Run inspect when a parser failure needs unsupported-node evidence.
- Run export with a `tmp/manual-audit/<logNo>/` output.
- Compare browser structure, `post.md`, and `report.json`.
- Record whether the result is `as-expected`, `mismatch`, `error`, or `not-checked`.

## Evidence Table
- Use `scripts/capture-post-evidence.ts` when the comparison needs a Markdown table row with source capture and converted Markdown.
- Use `--target post` for full-post evidence and `--target inspect-path --inspectPath <path>` for block-level evidence.
- Post evidence table rules live in `.agents/knowledge/post-evidence.md`.

## Code Anchors
- `scripts/export-single-post.ts`
- `scripts/lib/single-post-cli.ts`
- `src/modules/exporter/SinglePostInspect.ts`
- `src/modules/exporter/SinglePostExport.ts`
