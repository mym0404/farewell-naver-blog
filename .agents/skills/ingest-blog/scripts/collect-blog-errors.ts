#!/usr/bin/env bun

import { readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { NaverBlogExporter } from "../../../../src/modules/exporter/NaverBlogExporter.js"
import { NaverBlogFetcher } from "../../../../src/modules/fetcher/NaverBlogFetcher.js"
import {
  inspectSinglePost,
  type SinglePostInspectDiagnostics,
} from "../../../../src/modules/exporter/SinglePostInspect.js"
import { defaultExportOptions } from "../../../../src/shared/ExportOptions.js"
import { runWithLogSink } from "../../../../src/shared/Logger.js"
import type {
  ExportJobItem,
  ExportManifest,
  PostManifestEntry,
  ScanResult,
} from "../../../../src/shared/Types.js"
import {
  ensureDir,
  extractBlogId,
  resolveRepoPath,
  toErrorMessage,
} from "../../../../src/shared/Utils.js"
import {
  capturePostEvidence,
  createEvidenceTableRows,
} from "../../../../scripts/lib/post-evidence/capture.js"
import type { EvidenceCase } from "../../../../scripts/lib/post-evidence/cases.js"
import {
  findLatestReusableIngestOutput,
  loadReusableIngestOutput,
  type ReusableIngestOutput,
} from "../../../../scripts/lib/post-evidence/ingest-output.js"
import { renderEvidenceMarkdownTable } from "../../../../scripts/lib/post-evidence/table.js"

type CollectArgs = {
  blogId: string
  outputDir?: string
  reuseOutputDir?: string
  rerunFailures: boolean
  forceFull: boolean
  changesPath?: string
}

type CollectChanges = {
  parserChanges: string[]
  fixtures: string[]
  knowledge: string[]
  verification: Array<{
    command: string
    result: string
  }>
  unresolved: string[]
}

type FailedPostReport = {
  logNo: string
  title: string
  source: string
  error: string
  inspectReportPath: string | null
  inspectError: string | null
  editor: SinglePostInspectDiagnostics["editor"] | null
  parse: SinglePostInspectDiagnostics["parse"] | null
  unsupportedCount: number
  firstUnsupported:
    | {
        path: string
        tagName: string
        className?: string
        moduleType?: string
        text: string
        html: string
      }
    | null
}

type FailureGroup = {
  key: string
  count: number
  error: string
  editorType: string | null
  firstUnsupportedPath: string | null
  firstUnsupportedTag: string | null
  firstUnsupportedClassName: string | null
  firstUnsupportedModuleType: string | null
  representative: {
    logNo: string
    title: string
    source: string
    inspectReportPath: string | null
  }
  logNos: string[]
}

const usage = () => `Usage:
  bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts --blogId mym0404 [--outputDir tmp/harness/ingest-blog/mym0404]
  bun .agents/skills/ingest-blog/scripts/collect-blog-errors.ts --blogId mym0404 --reuseOutputDir tmp/harness/ingest-blog/mym0404 --rerunFailures

Options:
  --reuseOutputDir <dir>  Reuse a completed ingest output and rerun only failed posts.
  --rerunFailures        Require failed-post rerun from a reusable output.
  --forceFull            Ignore reusable output and run a full ingest.
  --changesPath <json>   Include parser/fixture/knowledge/verification changes in report.

Exports public posts with remote asset references, reuses completed outputs when possible, inspects failures, and writes report.md/report.json/evidence-table.md.`

const readValue = (args: string[], index: number) => {
  const value = args[index + 1]

  if (!value || value.startsWith("--")) {
    throw new Error(usage())
  }

  return value
}

const parseArgs = (args: string[]): CollectArgs | "help" => {
  let blogId: string | undefined
  let outputDir: string | undefined
  let reuseOutputDir: string | undefined
  let changesPath: string | undefined
  let rerunFailures = false
  let forceFull = false

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]

    if (arg === "--help" || arg === "-h") {
      return "help"
    }

    if (arg === "--blogId") {
      blogId = readValue(args, index)
      index++
      continue
    }

    if (arg === "--outputDir") {
      outputDir = readValue(args, index)
      index++
      continue
    }

    if (arg === "--reuseOutputDir") {
      reuseOutputDir = readValue(args, index)
      index++
      continue
    }

    if (arg === "--rerunFailures") {
      rerunFailures = true
      continue
    }

    if (arg === "--forceFull") {
      forceFull = true
      continue
    }

    if (arg === "--changesPath") {
      changesPath = readValue(args, index)
      index++
      continue
    }

    throw new Error(usage())
  }

  if (!blogId) {
    throw new Error(usage())
  }

  return {
    blogId,
    rerunFailures,
    forceFull,
    ...(outputDir ? { outputDir } : {}),
    ...(reuseOutputDir ? { reuseOutputDir } : {}),
    ...(changesPath ? { changesPath } : {}),
  }
}

const createIngestOptions = () => {
  const options = defaultExportOptions()

  options.assets.imageHandlingMode = "remote"
  options.assets.compressionEnabled = false
  options.assets.downloadImages = false
  options.assets.downloadThumbnails = false

  return options
}

const safePathSegment = (value: string) => {
  const segment = value.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "")

  return segment || "blog"
}

const createDefaultOutputDir = (blogId: string) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")

  return path.join("tmp", "harness", "ingest-blog", `${safePathSegment(blogId)}-${timestamp}`)
}

const isNotFoundError = (error: unknown) =>
  error instanceof Error &&
  typeof (error as { code?: unknown }).code === "string" &&
  (error as { code?: unknown }).code === "ENOENT"

const listFilesRecursive = async (dir: string): Promise<string[]> => {
  let entries: Awaited<ReturnType<typeof readdir>>

  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch (error) {
    if (isNotFoundError(error)) {
      return []
    }

    throw error
  }

  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        return listFilesRecursive(entryPath)
      }

      return [entryPath]
    }),
  )

  return nested.flat()
}

const writeJson = async ({ targetPath, value }: { targetPath: string; value: unknown }) => {
  await ensureDir(path.dirname(targetPath))
  await writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

const emptyChanges = (): CollectChanges => ({
  parserChanges: [],
  fixtures: [],
  knowledge: [],
  verification: [],
  unresolved: [],
})

const readChanges = async (changesPath: string | undefined) => {
  if (!changesPath) {
    return emptyChanges()
  }

  const value = JSON.parse(await readFile(changesPath, "utf8")) as Record<string, unknown>
  const readStringArray = (key: string) => {
    const items = value[key]

    return Array.isArray(items) ? items.filter((item): item is string => typeof item === "string") : []
  }
  const verification = Array.isArray(value.verification)
    ? value.verification.flatMap((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return []
        }

        const record = item as Record<string, unknown>

        return typeof record.command === "string" && typeof record.result === "string"
          ? [
              {
                command: record.command,
                result: record.result,
              },
            ]
          : []
      })
    : []

  return {
    parserChanges: readStringArray("parserChanges"),
    fixtures: readStringArray("fixtures"),
    knowledge: readStringArray("knowledge"),
    verification,
    unresolved: readStringArray("unresolved"),
  } satisfies CollectChanges
}

const compactError = (error: string) => error.replace(/\s+/g, " ").trim()

const firstUnsupportedOf = (diagnostics: SinglePostInspectDiagnostics | null) => {
  const node = diagnostics?.unsupportedNodes[0]

  if (!node) {
    return null
  }

  return {
    path: node.path,
    tagName: node.tagName,
    ...(node.className ? { className: node.className } : {}),
    ...(node.moduleType ? { moduleType: node.moduleType } : {}),
    text: node.text,
    html: node.html,
  }
}

const createFailureKey = (report: FailedPostReport) =>
  [
    compactError(report.error),
    report.editor?.type ?? "unknown-editor",
    report.firstUnsupported?.tagName ?? "unknown-tag",
    report.firstUnsupported?.className ?? "no-class",
    report.firstUnsupported?.moduleType ?? "no-module",
  ].join(" | ")

const groupFailures = (reports: FailedPostReport[]): FailureGroup[] => {
  const groups = new Map<string, FailedPostReport[]>()

  for (const report of reports) {
    const key = createFailureKey(report)
    const currentReports = groups.get(key) ?? []

    currentReports.push(report)
    groups.set(key, currentReports)
  }

  return Array.from(groups.entries())
    .map(([key, groupReports]) => {
      const representative = groupReports[0]

      if (!representative) {
        throw new Error("failure group cannot be empty")
      }

      return {
        key,
        count: groupReports.length,
        error: representative.error,
        editorType: representative.editor?.type ?? null,
        firstUnsupportedPath: representative.firstUnsupported?.path ?? null,
        firstUnsupportedTag: representative.firstUnsupported?.tagName ?? null,
        firstUnsupportedClassName: representative.firstUnsupported?.className ?? null,
        firstUnsupportedModuleType: representative.firstUnsupported?.moduleType ?? null,
        representative: {
          logNo: representative.logNo,
          title: representative.title,
          source: representative.source,
          inspectReportPath: representative.inspectReportPath,
        },
        logNos: groupReports.map((report) => report.logNo),
      }
    })
    .sort((left, right) => right.count - left.count || left.key.localeCompare(right.key))
}

const createJobItemFromManifestPost = (post: PostManifestEntry): ExportJobItem => ({
  id: post.outputPath ?? `failed:${post.logNo}`,
  logNo: post.logNo,
  title: post.title,
  source: post.source,
  category: post.category,
  status: post.status,
  outputPath: post.outputPath,
  assetPaths: post.assetPaths,
  upload: post.upload,
  error: post.error,
  updatedAt: new Date().toISOString(),
})

const createFailureRerunResumeState = (manifest: ExportManifest) => {
  const successfulPosts = manifest.posts.filter((post) => post.status === "success")

  return {
    items: successfulPosts.map(createJobItemFromManifestPost),
    manifest: {
      ...manifest,
      posts: successfulPosts,
      successCount: successfulPosts.length,
      failureCount: 0,
      finishedAt: null,
    },
  }
}

const createPostSummaryFromManifestPost = ({
  blogId,
  post,
  livePost,
}: {
  blogId: string
  post: PostManifestEntry
  livePost?: NonNullable<ScanResult["posts"]>[number]
}): NonNullable<ScanResult["posts"]>[number] => ({
  blogId,
  logNo: post.logNo,
  title: livePost?.title ?? post.title,
  publishedAt: livePost?.publishedAt ?? "",
  categoryId: livePost?.categoryId ?? post.category.id,
  categoryName: livePost?.categoryName ?? post.category.name,
  source: livePost?.source ?? post.source,
  thumbnailUrl: livePost?.thumbnailUrl ?? null,
})

const createFailureRerunScanResult = async ({
  blogId,
  manifest,
}: {
  blogId: string
  manifest: ExportManifest
}): Promise<ScanResult> => {
  const fetcher = new NaverBlogFetcher({
    blogId,
  })
  const liveScan = await fetcher.scanBlog({
    includePosts: true,
  })
  const livePostMap = new Map((liveScan.posts ?? []).map((post) => [post.logNo, post]))

  return {
    blogId,
    totalPostCount: manifest.totalPosts,
    categories: liveScan.categories.length > 0 ? liveScan.categories : manifest.categories,
    posts: manifest.posts.map((post) =>
      createPostSummaryFromManifestPost({
        blogId,
        post,
        livePost: livePostMap.get(post.logNo),
      }),
    ),
  }
}

const runExporter = async ({
  blogId,
  outputDir,
  options,
  logs,
  reusableOutput,
  cachedScanResult,
}: {
  blogId: string
  outputDir: string
  options: ReturnType<typeof createIngestOptions>
  logs: string[]
  reusableOutput?: ReusableIngestOutput
  cachedScanResult?: ScanResult
}) => {
  const exporter = new NaverBlogExporter({
    request: {
      blogIdOrUrl: blogId,
      outputDir,
      profile: "gfm",
      options,
    },
    resumeState: reusableOutput
      ? createFailureRerunResumeState(reusableOutput.manifest)
      : undefined,
    cachedScanResult,
    onProgress: ({ total, completed, failed }) => {
      console.error(`progress: ${completed + failed}/${total} completed=${completed} failed=${failed}`)
    },
    onItem: (item) => {
      if (item.status === "failed") {
        console.error(`failed: ${item.logNo} ${item.error ?? ""}`)
      }
    },
  })

  return runWithLogSink(
    (message) => {
      logs.push(message)
      console.error(message)
    },
    () => exporter.run(),
  )
}

const renderFailureSummaryMarkdown = ({
  blogId,
  manifest,
  failureGroups,
  downloadedAssetFiles,
}: {
  blogId: string
  manifest: ExportManifest
  failureGroups: FailureGroup[]
  downloadedAssetFiles: string[]
}) => {
  const lines = [
    `# Ingest Failure Summary: ${blogId}`,
    "",
    `- totalPosts: ${manifest.totalPosts}`,
    `- successCount: ${manifest.successCount}`,
    `- failureCount: ${manifest.failureCount}`,
    `- downloadedAssetFileCount: ${downloadedAssetFiles.length}`,
    "",
  ]

  if (failureGroups.length === 0) {
    return [...lines, "No parse failures.", ""].join("\n")
  }

  return [
    ...lines,
    "## Failure Groups",
    "",
    ...failureGroups.flatMap((group, index) => [
      `### ${index + 1}. ${group.editorType ?? "unknown-editor"} / ${group.firstUnsupportedTag ?? "unknown-tag"}`,
      "",
      `- count: ${group.count}`,
      `- error: ${group.error}`,
      `- representativeLogNo: ${group.representative.logNo}`,
      `- representativeTitle: ${group.representative.title}`,
      `- inspectReportPath: ${group.representative.inspectReportPath ?? "(not available)"}`,
      "",
    ]),
  ].join("\n")
}

const renderList = (items: string[]) => {
  if (items.length === 0) {
    return "- 없음"
  }

  return items.map((item) => `- ${item}`).join("\n")
}

const renderVerificationList = (items: CollectChanges["verification"]) => {
  if (items.length === 0) {
    return "- 없음"
  }

  return items.map((item) => `- ${item.command}: ${item.result}`).join("\n")
}

const renderDeferredList = ({
  failureGroups,
  unresolved,
}: {
  failureGroups: FailureGroup[]
  unresolved: string[]
}) => {
  if (failureGroups.length === 0) {
    return "- 없음"
  }

  if (unresolved.length > 0) {
    return renderList(unresolved)
  }

  return failureGroups
    .map((group) => `- ${group.representative.logNo}: 보류 사유 미기재`)
    .join("\n")
}

const renderIngestReportMarkdown = ({
  blogId,
  manifest,
  outputDir,
  reuse,
  rerunResults,
  failureGroups,
  downloadedAssetFiles,
  changes,
  evidenceTablePath,
}: {
  blogId: string
  manifest: ExportManifest
  outputDir: string
  reuse: {
    used: boolean
    mode: "full" | "rerun-failures" | "completed-no-failures"
    sourceOutputDir: string | null
    previousFailureCount: number
  }
  rerunResults: Array<{
    logNo: string
    beforeError: string | null
    status: PostManifestEntry["status"] | "missing"
    afterError: string | null
  }>
  failureGroups: FailureGroup[]
  downloadedAssetFiles: string[]
  changes: CollectChanges
  evidenceTablePath: string
}) => [
  `# Ingest Report: ${blogId}`,
  "",
  "## Target",
  "",
  `- outputDir: ${outputDir}`,
  `- reuseUsed: ${reuse.used}`,
  `- reuseMode: ${reuse.mode}`,
  `- reuseSourceOutputDir: ${reuse.sourceOutputDir ?? "(none)"}`,
  "",
  "## Counts",
  "",
  `- totalPosts: ${manifest.totalPosts}`,
  `- successCount: ${manifest.successCount}`,
  `- failureCount: ${manifest.failureCount}`,
  `- previousFailureCount: ${reuse.previousFailureCount}`,
  `- downloadedAssetFileCount: ${downloadedAssetFiles.length}`,
  "",
  "## Rerun Results",
  "",
  ...(rerunResults.length === 0
    ? ["- 없음"]
    : rerunResults.map(
        (result) =>
          `- ${result.logNo}: ${result.status} (before=${result.beforeError ?? "none"}, after=${result.afterError ?? "none"})`,
      )),
  "",
  "## Parser Changes",
  "",
  renderList(changes.parserChanges),
  "",
  "## Fixtures",
  "",
  renderList(changes.fixtures),
  "",
  "## Knowledge",
  "",
  renderList(changes.knowledge),
  "",
  "## Verification",
  "",
  renderVerificationList(changes.verification),
  "",
  "## Evidence Table",
  "",
  `- path: ${evidenceTablePath}`,
  "",
  "## Unresolved Failures",
  "",
  ...(failureGroups.length === 0
    ? ["- 없음"]
    : failureGroups.map(
        (group) =>
          `- ${group.representative.logNo}: ${group.error} (${group.count} posts, inspect=${group.representative.inspectReportPath ?? "none"})`,
      )),
  "",
  "## Deferred",
  "",
  renderDeferredList({
    failureGroups,
    unresolved: changes.unresolved,
  }),
  "",
].join("\n")

const inspectFailedPost = async ({
  blogId,
  failedPost,
  inspectDir,
}: {
  blogId: string
  failedPost: PostManifestEntry
  inspectDir: string
}): Promise<FailedPostReport> => {
  const reportPath = path.join(inspectDir, `${failedPost.logNo}.json`)

  try {
    const diagnostics = await inspectSinglePost({
      blogId,
      logNo: failedPost.logNo,
      options: createIngestOptions(),
    })
    await writeJson({
      targetPath: reportPath,
      value: diagnostics,
    })

    return {
      logNo: failedPost.logNo,
      title: failedPost.title,
      source: failedPost.source,
      error: failedPost.error ?? "Unknown export failure",
      inspectReportPath: reportPath,
      inspectError: null,
      editor: diagnostics.editor,
      parse: diagnostics.parse,
      unsupportedCount: diagnostics.unsupportedNodes.length,
      firstUnsupported: firstUnsupportedOf(diagnostics),
    }
  } catch (error) {
    return {
      logNo: failedPost.logNo,
      title: failedPost.title,
      source: failedPost.source,
      error: failedPost.error ?? "Unknown export failure",
      inspectReportPath: null,
      inspectError: toErrorMessage(error),
      editor: null,
      parse: null,
      unsupportedCount: 0,
      firstUnsupported: null,
    }
  }
}

const createEvidenceCases = ({
  blogId,
  failureGroups,
  rerunResults,
  manifest,
}: {
  blogId: string
  failureGroups: FailureGroup[]
  rerunResults: Array<{
    logNo: string
    beforeError: string | null
    status: PostManifestEntry["status"] | "missing"
    afterError: string | null
  }>
  manifest: ExportManifest
}): EvidenceCase[] => {
  if (failureGroups.length > 0) {
    return failureGroups.map((group) => {
      const targetReport = group.representative

      return {
        blogId,
        logNo: targetReport.logNo,
        metadata: {
          title: targetReport.title,
          status: "failed",
          error: group.error,
        },
        target: group.firstUnsupportedPath
          ? {
              kind: "inspect-path",
              path: group.firstUnsupportedPath,
            }
          : {
              kind: "post",
            },
      }
    })
  }

  return rerunResults
    .filter((result) => result.status === "success")
    .slice(0, 5)
    .map((result) => {
      const post = manifest.posts.find((entry) => entry.logNo === result.logNo)

      return {
        blogId,
        logNo: result.logNo,
        metadata: {
          title: post?.title ?? result.logNo,
          status: "rerun-success",
          beforeError: result.beforeError ?? "",
        },
        target: {
          kind: "post",
        },
      }
    })
}

const run = async () => {
  const parsedArgs = parseArgs(process.argv.slice(2))

  if (parsedArgs === "help") {
    console.log(usage())
    return
  }

  const blogId = extractBlogId(parsedArgs.blogId)
  const logs: string[] = []
  const options = createIngestOptions()
  const explicitReuseOutputDir = parsedArgs.reuseOutputDir ?? parsedArgs.outputDir
  const reusableOutput =
    parsedArgs.forceFull
      ? null
      : explicitReuseOutputDir
        ? await loadReusableIngestOutput({
            blogId,
            outputDir: explicitReuseOutputDir,
          })
        : await findLatestReusableIngestOutput({
            blogId,
          })

  if (parsedArgs.rerunFailures && !reusableOutput) {
    throw new Error(`재사용 가능한 완료 output을 찾지 못했습니다: ${blogId}`)
  }

  const reuseMode: "full" | "rerun-failures" | "completed-no-failures" =
    reusableOutput && reusableOutput.failedPosts.length === 0
      ? "completed-no-failures"
      : reusableOutput
        ? "rerun-failures"
        : "full"
  const outputDir =
    reusableOutput?.outputDir ?? parsedArgs.outputDir ?? createDefaultOutputDir(blogId)
  const resolvedOutputDir = resolveRepoPath(outputDir)
  const previousFailedPosts = reusableOutput?.failedPosts ?? []
  const cachedScanResult =
    reuseMode === "rerun-failures" && reusableOutput
      ? await createFailureRerunScanResult({
          blogId,
          manifest: reusableOutput.manifest,
        })
      : undefined
  const manifest =
    reuseMode === "completed-no-failures" && reusableOutput
      ? reusableOutput.manifest
      : await runExporter({
          blogId,
          outputDir,
          options,
          logs,
          ...(reusableOutput ? { reusableOutput } : {}),
          ...(cachedScanResult ? { cachedScanResult } : {}),
        })
  const rerunResults = previousFailedPosts.map((previousPost) => {
    const currentPost = manifest.posts.find((post) => post.logNo === previousPost.logNo)

    return {
      logNo: previousPost.logNo,
      beforeError: previousPost.error,
      status: currentPost?.status ?? "missing",
      afterError: currentPost?.error ?? null,
    }
  })
  const failedPosts = manifest.posts.filter((post) => post.status === "failed")
  const inspectDir = path.join(resolvedOutputDir, "inspect")
  const failedPostReports = await Promise.all(
    failedPosts.map((failedPost) =>
      inspectFailedPost({
        blogId,
        failedPost,
        inspectDir,
      }),
    ),
  )
  const failureGroups = groupFailures(failedPostReports)
  const downloadedAssetFiles = await listFilesRecursive(path.join(resolvedOutputDir, "public"))
  const manifestPath = path.join(resolvedOutputDir, "manifest.json")
  const failureSummaryJsonPath = path.join(resolvedOutputDir, "failure-summary.json")
  const failureSummaryMarkdownPath = path.join(resolvedOutputDir, "failure-summary.md")
  const reportJsonPath = path.join(resolvedOutputDir, "report.json")
  const reportMarkdownPath = path.join(resolvedOutputDir, "report.md")
  const evidenceTablePath = path.join(resolvedOutputDir, "evidence-table.md")
  const logPath = path.join(resolvedOutputDir, "ingest.log")
  const changes = await readChanges(parsedArgs.changesPath)
  const evidenceCases = createEvidenceCases({
    blogId,
    failureGroups,
    rerunResults,
    manifest,
  })
  let evidenceReport: Awaited<ReturnType<typeof capturePostEvidence>> | null = null
  let evidenceError: string | null = null

  if (evidenceCases.length > 0) {
    try {
      evidenceReport = await capturePostEvidence({
        cases: evidenceCases,
        outputDir: path.join(resolvedOutputDir, "post-evidence"),
        assetProfile: "temporary",
      })
      await writeFile(
        evidenceTablePath,
        renderEvidenceMarkdownTable(
          createEvidenceTableRows({
            rows: evidenceReport.rows,
            tablePath: evidenceTablePath,
          }),
        ),
        "utf8",
      )
    } catch (error) {
      evidenceError = toErrorMessage(error)
      await writeFile(evidenceTablePath, renderEvidenceMarkdownTable([]), "utf8")
    }
  } else {
    await writeFile(evidenceTablePath, renderEvidenceMarkdownTable([]), "utf8")
  }
  const summary = {
    blogId,
    outputDir: resolvedOutputDir,
    manifestPath,
    reportJsonPath,
    reportMarkdownPath,
    evidenceTablePath,
    totalPosts: manifest.totalPosts,
    successCount: manifest.successCount,
    failureCount: manifest.failureCount,
    reuse: {
      used: Boolean(reusableOutput),
      mode: reuseMode,
      sourceOutputDir: reusableOutput?.outputDir ?? null,
      previousFailureCount: previousFailedPosts.length,
    },
    rerunResults,
    assetMode: options.assets.imageHandlingMode,
    imageDownloadsDisabled: !options.assets.downloadImages && !options.assets.downloadThumbnails,
    downloadedAssetFileCount: downloadedAssetFiles.length,
    downloadedAssetFiles,
    failedPosts: failedPostReports,
    failureGroups,
    changes,
    evidence: {
      report: evidenceReport,
      error: evidenceError,
      errorCount: evidenceReport?.errorCount ?? (evidenceError ? 1 : 0),
    },
  }

  await writeJson({
    targetPath: failureSummaryJsonPath,
    value: summary,
  })
  await writeJson({
    targetPath: reportJsonPath,
    value: summary,
  })
  await writeFile(
    failureSummaryMarkdownPath,
    renderFailureSummaryMarkdown({
      blogId,
      manifest,
      failureGroups,
      downloadedAssetFiles,
    }),
    "utf8",
  )
  await writeFile(
    reportMarkdownPath,
    renderIngestReportMarkdown({
      blogId,
      manifest,
      outputDir: resolvedOutputDir,
      reuse: summary.reuse,
      rerunResults,
      failureGroups,
      downloadedAssetFiles,
      changes,
      evidenceTablePath,
    }),
    "utf8",
  )
  await writeFile(logPath, `${logs.join("\n")}${logs.length > 0 ? "\n" : ""}`, "utf8")

  console.log(
    [
      `blogId: ${blogId}`,
      `outputDir: ${resolvedOutputDir}`,
      `manifestPath: ${manifestPath}`,
      `reportJsonPath: ${reportJsonPath}`,
      `reportMarkdownPath: ${reportMarkdownPath}`,
      `evidenceTablePath: ${evidenceTablePath}`,
      `failureSummaryJsonPath: ${failureSummaryJsonPath}`,
      `failureSummaryMarkdownPath: ${failureSummaryMarkdownPath}`,
      `reuseMode: ${reuseMode}`,
      `failureCount: ${manifest.failureCount}`,
      `failureGroupCount: ${failureGroups.length}`,
      `evidenceErrorCount: ${summary.evidence.errorCount}`,
      `downloadedAssetFileCount: ${downloadedAssetFiles.length}`,
    ].join("\n"),
  )

  if (manifest.failureCount > 0 || downloadedAssetFiles.length > 0 || summary.evidence.errorCount > 0) {
    process.exitCode = 1
  }
}

try {
  await run()
} catch (error) {
  console.error(toErrorMessage(error))
  process.exitCode = 1
}
