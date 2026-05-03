import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { chromium, type Browser } from "playwright"

import { createBodyNodesFromStructuredBlocks } from "../../../src/modules/blocks/BodyNodeUtils.js"
import { NaverBlog } from "../../../src/modules/blog/NaverBlog.js"
import { renderMarkdownPost } from "../../../src/modules/converter/MarkdownRenderer.js"
import { AssetStore } from "../../../src/modules/exporter/AssetStore.js"
import { buildMarkdownFilePath, getCategoryForPost } from "../../../src/modules/exporter/ExportPaths.js"
import { buildMarkdownViewerShareUrl } from "../../../src/modules/exporter/MarkdownViewerShareUrl.js"
import { buildPostLinkTargets, createSameBlogPostLinkResolver } from "../../../src/modules/exporter/PostLinkRewriter.js"
import { NaverBlogFetcher } from "../../../src/modules/fetcher/NaverBlogFetcher.js"
import { parsePostHtmlWithBlockEvidence } from "../../../src/modules/parser/PostParser.js"
import { cloneExportOptions, defaultExportOptions } from "../../../src/shared/ExportOptions.js"
import type { AstBlock, ExportOptions, ParsedPost } from "../../../src/shared/Types.js"
import { ensureDir, extractBlogId, mapConcurrent, toErrorMessage } from "../../../src/shared/Utils.js"
import { readSinglePostOptions } from "../single-post-cli.js"
import type { EvidenceCase } from "./cases.js"
import { captureNaverPost, captureRenderer } from "./playwright.js"
import {
  createDefaultEvidenceOutputDir,
  type EvidenceAssetProfile,
  resolveEvidenceOutputPaths,
  safeEvidencePathSegment,
  toMarkdownAssetPath,
} from "./paths.js"
import { renderEvidenceMarkdownTable, type EvidenceTableRow } from "./table.js"

export type EvidenceRowReport = {
  blogId: string
  logNo: string
  target: EvidenceCase["target"]
  metadata: EvidenceCase["metadata"]
  sourceUrl: string
  rendererUrl: string | null
  rendererError: string | null
  naverCaptureAssetPath: string | null
  naverCapturePath: string | null
  markdown: string | null
  renderedCaptureAssetPath: string | null
  renderedCapturePath: string | null
  errors: string[]
}

export type PostEvidenceReport = {
  outputDir: string
  tablePath: string
  reportPath: string
  assetDir: string
  errorCount: number
  rows: EvidenceRowReport[]
}

const createDefaultEvidenceOptions = () => {
  const options = defaultExportOptions()

  options.assets.imageHandlingMode = "remote"
  options.assets.compressionEnabled = false
  options.assets.downloadImages = false
  options.assets.downloadThumbnails = false
  options.frontmatter.fields.exportedAt = false

  return options
}

const readEvidenceOptions = async (optionsPath: string | undefined) => {
  const options = optionsPath
    ? await readSinglePostOptions({
        optionsPath,
        readFile,
      })
    : createDefaultEvidenceOptions()

  return cloneExportOptions(options, {
    blockOutputDefinitions: new NaverBlog().getBlockOutputDefinitions(),
  })
}

const createRemoteAssetRecord = ({
  kind,
  sourceUrl,
}: {
  kind: "image" | "thumbnail"
  sourceUrl: string
}) => ({
  kind,
  sourceUrl,
  reference: sourceUrl,
  relativePath: null,
  storageMode: "remote" as const,
  uploadCandidate: null,
})

const createFragmentParsedPost = ({
  parsedPost,
  blocks,
}: {
  parsedPost: ParsedPost
  blocks: AstBlock[]
}): ParsedPost => ({
  tags: parsedPost.tags,
  blocks,
  body: createBodyNodesFromStructuredBlocks(blocks),
  videos: blocks
    .filter((block): block is Extract<AstBlock, { type: "video" }> => block.type === "video")
    .map((block) => block.video),
})

const selectTargetParsedPost = ({
  parsedPost,
  target,
}: {
  parsedPost: ParsedPost & {
    blockEvidence: Array<{
      path: string
      block: AstBlock
    }>
  }
  target: EvidenceCase["target"]
}) => {
  if (target.kind === "post") {
    return parsedPost
  }

  const blocks = parsedPost.blockEvidence
    .filter((evidence) => evidence.path === target.path || evidence.path.startsWith(`${target.path}.`))
    .map((evidence) => evidence.block)

  if (blocks.length === 0) {
    throw new Error(`inspect path에 대응하는 parsed block이 없습니다: ${target.path}`)
  }

  return createFragmentParsedPost({
    parsedPost,
    blocks,
  })
}

const createCaptureFilename = ({
  blogId,
  logNo,
  target,
  kind,
}: {
  blogId: string
  logNo: string
  target: EvidenceCase["target"]
  kind: "naver" | "rendered"
}) => {
  const targetSegment =
    target.kind === "post" ? "post" : `path-${safeEvidencePathSegment(target.path)}`

  return `${safeEvidencePathSegment(blogId)}-${safeEvidencePathSegment(logNo)}-${targetSegment}-${kind}.png`
}

const renderEvidenceMarkdown = async ({
  blogId,
  logNo,
  outputDir,
  options,
  fetcher,
  html,
  target,
}: {
  blogId: string
  logNo: string
  outputDir: string
  options: ExportOptions
  fetcher: NaverBlogFetcher
  html: string
  target: EvidenceCase["target"]
}) => {
  const scan = await fetcher.scanBlog({
    includePosts: true,
  })
  const posts = scan.posts ?? []
  const post = posts.find((entry) => entry.logNo === logNo)

  if (!post) {
    throw new Error(`공개 글 메타데이터를 찾을 수 없습니다: ${blogId}/${logNo}`)
  }

  const categoryMap = new Map(scan.categories.map((category) => [category.id, category]))
  const category = getCategoryForPost({
    categories: categoryMap,
    categoryId: post.categoryId,
    categoryName: post.categoryName,
  })
  const markdownFilePath = buildMarkdownFilePath({
    outputDir,
    post,
    category,
    options,
  })
  const postLinkTargets = buildPostLinkTargets({
    outputDir,
    posts,
    categories: scan.categories,
    options,
  })
  const resolveLinkUrl = createSameBlogPostLinkResolver({
    blogId,
    markdownFilePath,
    options,
    targets: postLinkTargets,
  })
  const parsedPost = parsePostHtmlWithBlockEvidence({
    html,
    sourceUrl: post.source,
    options: {
      blockOutputs: options.blockOutputs,
      resolveLinkUrl,
    },
  })
  const targetParsedPost = selectTargetParsedPost({
    parsedPost,
    target,
  })
  const renderOptions = cloneExportOptions(
    {
      ...options,
      frontmatter: {
        ...options.frontmatter,
        enabled: target.kind === "post" ? options.frontmatter.enabled : false,
      },
      assets: {
        ...options.assets,
        thumbnailSource: target.kind === "post" ? options.assets.thumbnailSource : "none",
      },
    },
    {
      blockOutputDefinitions: new NaverBlog().getBlockOutputDefinitions(),
    },
  )
  const assetStore = new AssetStore({
    outputDir,
    downloader: fetcher,
    options: renderOptions,
  })
  const rendered = await renderMarkdownPost({
    post,
    category,
    parsedPost: targetParsedPost,
    markdownFilePath,
    options: renderOptions,
    resolveLinkUrl,
    resolveAsset:
      renderOptions.assets.imageHandlingMode === "remote" ||
      (!renderOptions.assets.downloadImages && !renderOptions.assets.downloadThumbnails)
        ? async ({ kind, sourceUrl }) => createRemoteAssetRecord({ kind, sourceUrl })
        : async (input) => assetStore.saveAsset(input),
  })

  return {
    editorType: new NaverBlog().getEditorForHtml(html)?.type ?? null,
    sourceUrl: post.source,
    markdown: rendered.markdown,
  }
}

const captureCase = async ({
  browser,
  evidenceCase,
  outputDir,
  tablePath,
  assetDir,
}: {
  browser: Browser
  evidenceCase: EvidenceCase
  outputDir: string
  tablePath: string
  assetDir: string
}): Promise<EvidenceRowReport> => {
  const blogId = extractBlogId(evidenceCase.blogId)
  const fetcher = new NaverBlogFetcher({
    blogId,
  })
  const options = await readEvidenceOptions(evidenceCase.optionsPath)
  const html = await fetcher.fetchPostHtml(evidenceCase.logNo)
  const errors: string[] = []
  let sourceUrl = `https://blog.naver.com/${blogId}/${evidenceCase.logNo}`
  let editorType: string | null = new NaverBlog().getEditorForHtml(html)?.type ?? null
  let markdown: string | null = null
  let rendererUrl: string | null = null
  let rendererError: string | null = null

  try {
    const rendered = await renderEvidenceMarkdown({
      blogId,
      logNo: evidenceCase.logNo,
      outputDir,
      options,
      fetcher,
      html,
      target: evidenceCase.target,
    })

    editorType = rendered.editorType
    sourceUrl = rendered.sourceUrl
    markdown = rendered.markdown
    rendererUrl = buildMarkdownViewerShareUrl(markdown)

    if (!rendererUrl) {
      rendererError = "renderer share URL length exceeded"
    }
  } catch (error) {
    rendererError = toErrorMessage(error)
    errors.push(rendererError)
  }

  const naverCapturePath = path.join(
    assetDir,
    createCaptureFilename({
      blogId,
      logNo: evidenceCase.logNo,
      target: evidenceCase.target,
      kind: "naver",
    }),
  )
  let renderedCapturePath: string | null = null
  let renderedCaptureAssetPath: string | null = null

  try {
    await captureNaverPost({
      browser,
      blogId,
      logNo: evidenceCase.logNo,
      editorType,
      inspectPath: evidenceCase.target.kind === "inspect-path" ? evidenceCase.target.path : undefined,
      outputPath: naverCapturePath,
    })
  } catch (error) {
    errors.push(`Naver capture failed: ${toErrorMessage(error)}`)
  }

  if (rendererUrl) {
    renderedCaptureAssetPath = path.join(
      assetDir,
      createCaptureFilename({
        blogId,
        logNo: evidenceCase.logNo,
        target: evidenceCase.target,
        kind: "rendered",
      }),
    )
    renderedCapturePath = renderedCaptureAssetPath

    try {
      await captureRenderer({
        browser,
        rendererUrl,
        outputPath: renderedCaptureAssetPath,
      })
    } catch (error) {
      errors.push(`Renderer capture failed: ${toErrorMessage(error)}`)
      renderedCapturePath = null
      renderedCaptureAssetPath = null
    }
  }

  const naverCaptureFailed = errors.some((error) => error.startsWith("Naver capture failed"))

  return {
    blogId,
    logNo: evidenceCase.logNo,
    target: evidenceCase.target,
    metadata: evidenceCase.metadata,
    sourceUrl,
    rendererUrl,
    rendererError,
    naverCaptureAssetPath: naverCaptureFailed ? null : naverCapturePath,
    naverCapturePath: naverCaptureFailed
      ? null
      : toMarkdownAssetPath({
          markdownFilePath: tablePath,
          assetPath: naverCapturePath,
        }),
    markdown,
    renderedCaptureAssetPath,
    renderedCapturePath: renderedCapturePath
      ? toMarkdownAssetPath({
          markdownFilePath: tablePath,
          assetPath: renderedCapturePath,
        })
      : null,
    errors,
  }
}

export const createEvidenceTableRows = ({
  rows,
  tablePath,
}: {
  rows: EvidenceRowReport[]
  tablePath: string
}): EvidenceTableRow[] =>
  rows.map((row) => ({
    metadata: row.metadata,
    sourceUrl: row.sourceUrl,
    rendererUrl: row.rendererUrl,
    rendererError: row.rendererError,
    naverCapturePath: row.naverCaptureAssetPath
      ? toMarkdownAssetPath({
          markdownFilePath: tablePath,
          assetPath: row.naverCaptureAssetPath,
        })
      : null,
    markdown: row.markdown,
    renderedCapturePath: row.renderedCaptureAssetPath
      ? toMarkdownAssetPath({
          markdownFilePath: tablePath,
          assetPath: row.renderedCaptureAssetPath,
        })
      : null,
  }))

export const capturePostEvidence = async ({
  cases,
  outputDir,
  assetProfile = "temporary",
  browser,
}: {
  cases: EvidenceCase[]
  outputDir?: string
  assetProfile?: EvidenceAssetProfile
  browser?: Browser
}): Promise<PostEvidenceReport> => {
  const firstCase = cases[0]

  if (!firstCase) {
    throw new Error("capture evidence case가 없습니다.")
  }

  const resolvedOutputDir = outputDir ?? createDefaultEvidenceOutputDir({
    blogId: firstCase.blogId,
    logNo: firstCase.logNo,
  })
  const paths = await resolveEvidenceOutputPaths({
    outputDir: resolvedOutputDir,
    assetProfile,
  })
  const ownedBrowser = browser ? null : await chromium.launch()

  try {
    const activeBrowser = browser ?? ownedBrowser

    if (!activeBrowser) {
      throw new Error("Playwright browser를 시작하지 못했습니다.")
    }

    const rows = await mapConcurrent({
      items: cases,
      concurrency: 2,
      mapper: async (evidenceCase) =>
        captureCase({
          browser: activeBrowser,
          evidenceCase,
          outputDir: paths.outputDir,
          tablePath: paths.tablePath,
          assetDir: paths.assetDir,
        }),
    })
    const tableRows = createEvidenceTableRows({
      rows,
      tablePath: paths.tablePath,
    })
    const errorCount = rows.reduce((count, row) => count + row.errors.length, 0)

    await ensureDir(path.dirname(paths.tablePath))
    await writeFile(paths.tablePath, renderEvidenceMarkdownTable(tableRows), "utf8")

    const report = {
      outputDir: paths.outputDir,
      tablePath: paths.tablePath,
      reportPath: paths.reportPath,
      assetDir: paths.assetDir,
      errorCount,
      rows,
    } satisfies PostEvidenceReport

    await writeFile(paths.reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")

    return report
  } finally {
    await ownedBrowser?.close()
  }
}
