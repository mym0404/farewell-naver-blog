# Single Post Verification

## Purpose
- Use this path to compare one public Naver Blog post against the single-post export CLI and manual browser observation.

## Command Shape
```bash
bun scripts/export-single-post.ts \
  --blogId mym0404 \
  --logNo 223034929697 \
  --outputDir tmp/manual-audit/223034929697/output \
  --report tmp/manual-audit/223034929697/report.json \
  --manualReviewMarkdownPath tmp/manual-audit/223034929697/post.md \
  --metadataCachePath tmp/manual-audit/223034929697/metadata-cache.json
```

## Manual Loop
- Open the public post in a browser.
- Record visible editor version clues, block types, and unusual structure.
- Run the CLI with a `tmp/manual-audit/<logNo>/` output.
- Compare browser structure, `post.md`, `report.json`, and parser warnings.
- Record whether the result is `as-expected`, `mismatch`, `error`, or `not-checked`.

## Code Anchors
- `scripts/export-single-post.ts`
- `scripts/lib/single-post-cli.ts`
- `src/modules/exporter/SinglePostExport.ts`
