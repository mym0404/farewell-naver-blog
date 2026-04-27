# Architecture

## Current Shape
- Runtime entrypoint is `src/Server.ts`.
- HTTP API, Vite middleware, job lifecycle, upload trigger/polling, and bootstrap recovery live in `src/server/HttpServer.ts`.
- The export pipeline lives in `src/modules/exporter/NaverBlogExporter.ts` and keeps fetch, parse, review, render, write, upload, rewrite, and manifest concerns separated.
- UI calls HTTP APIs only. It does not import server or exporter internals.

## Main Flow
- Blog scan and post HTML fetch start in `src/modules/blog-fetcher/NaverBlogFetcher.ts`.
- `src/modules/parser/PostParser.ts` detects the Naver editor version and dispatches to `src/modules/parser/editors/NaverBlogSe2Editor.ts`, `NaverBlogSe3Editor.ts`, or `NaverBlogSe4Editor.ts`.
- Editor classes own block ordering and source-level context. Block-specific `match` and `convert` logic stays in `src/modules/parser/blocks/*`.
- `src/modules/reviewer/PostReviewer.ts` normalizes parse warnings before rendering.
- `src/modules/converter/MarkdownRenderer.ts` renders AST blocks, frontmatter, image references, tables, callouts, and fallback HTML into Markdown.
- `src/modules/exporter/ExportPaths.ts`, `AssetStore.ts`, `PostLinkRewriter.ts`, and `ExportJobManifest.ts` handle output paths, deduped assets, post links, and `manifest.json`.

## Module Boundaries
- `src/modules/blog-fetcher`: Naver mobile API, post HTML fetch, asset download inputs.
- `src/modules/parser`: SE2, SE3, SE4 HTML structures to common AST.
- `src/modules/reviewer`: parse warning cleanup and review output.
- `src/modules/converter`: AST to Markdown and frontmatter.
- `src/modules/exporter`: export orchestration, asset persistence, upload/rewrite phase, single-post export.
- `src/server`: local HTTP server, job store, local state/cache, upload provider catalog.
- `src/shared`: cross-boundary types, export options, parser block registry, path templates, UI/job state.
- `src/ui`: React wizard, scan/options/results/resume surfaces, shadcn primitives, API client.

## Parser Block Contract
- Parser block registry source of truth is `src/modules/blog/BlogRegistry.ts`.
- Output family source of truth is `src/shared/BlockRegistry.ts`.
- Parser block base classes are in `src/modules/parser/blocks/ParserNode.ts`.
- Shared helpers are in `src/modules/parser/blocks/common` or next to the editor-specific blocks they support.
- SE2 blocks live under `src/modules/parser/blocks/naver-se2`.
- SE3 blocks live under `src/modules/parser/blocks/naver-se3`.
- SE4 blocks live under `src/modules/parser/blocks/naver-se4`.
- Fixture-backed sample coverage lives in `tests/fixtures/samples/*` and `tests/sample-fixtures.test.ts`.

## Important Seams
- Parser block changes usually touch `src/modules/blog/BlogRegistry.ts`, `src/shared/BlockRegistry.ts`, `src/modules/parser/blocks/*`, focused parser tests, and `.agents/knowledge/fixtures.md`.
- Renderer or exporter output changes usually affect `tests/fixtures/samples/*/expected.md`, `tests/markdown-renderer.test.ts`, `tests/naver-blog-exporter.test.ts`, and UI result assumptions.
- Job lifecycle changes usually affect `src/server/HttpServer.ts`, `src/server/JobStore.ts`, `src/server/ExportJobManifest.ts`, `src/ui/features/job-results/*`, and `.agents/knowledge/upload.md`.
- UI shell changes usually affect `src/ui/App.tsx`, `src/ui/features/common/*`, `src/ui/styles/globals.css`, and `.agents/knowledge/design.md`.
