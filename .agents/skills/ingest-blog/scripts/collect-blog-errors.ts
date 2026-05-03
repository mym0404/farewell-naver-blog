#!/usr/bin/env bun

import { readdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { NaverBlogExporter } from "../../../../src/modules/exporter/NaverBlogExporter.js"
import {
  inspectSinglePost,
  type SinglePostInspectDiagnostics,
} from "../../../../src/modules/exporter/SinglePostInspect.js"
import { defaultExportOptions } from "../../../../src/shared/ExportOptions.js"
import { runWithLogSink } from "../../../../src/shared/Logger.js"
import type { ExportManifest, PostManifestEntry } from "../../../../src/shared/Types.js"
import {
  ensureDir,
  extractBlogId,
  resolveRepoPath,
  toErrorMessage,
} from "../../../../src/shared/Utils.js"

type CollectArgs = {
  blogId: string
  outputDir?: string
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

Exports every public post with remote asset references, writes manifest.json, inspects failed posts, and summarizes parse failures.`

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

    throw new Error(usage())
  }

  if (!blogId) {
    throw new Error(usage())
  }

  return {
    blogId,
    ...(outputDir ? { outputDir } : {}),
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

const compactError = (error: string) => error.replace(/\s+/g, " ").trim()

const firstUnsupportedOf = (diagnostics: SinglePostInspectDiagnostics | null) => {
  const node = diagnostics?.unsupportedNodes[0]

  if (!node) {
    return null
  }

  return {
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

const run = async () => {
  const parsedArgs = parseArgs(process.argv.slice(2))

  if (parsedArgs === "help") {
    console.log(usage())
    return
  }

  const blogId = extractBlogId(parsedArgs.blogId)
  const outputDir = parsedArgs.outputDir ?? createDefaultOutputDir(blogId)
  const resolvedOutputDir = resolveRepoPath(outputDir)
  const logs: string[] = []
  const options = createIngestOptions()
  const exporter = new NaverBlogExporter({
    request: {
      blogIdOrUrl: blogId,
      outputDir,
      profile: "gfm",
      options,
    },
    onProgress: ({ total, completed, failed }) => {
      console.error(`progress: ${completed + failed}/${total} completed=${completed} failed=${failed}`)
    },
    onItem: (item) => {
      if (item.status === "failed") {
        console.error(`failed: ${item.logNo} ${item.error ?? ""}`)
      }
    },
  })

  const manifest = await runWithLogSink(
    (message) => {
      logs.push(message)
      console.error(message)
    },
    () => exporter.run(),
  )
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
  const logPath = path.join(resolvedOutputDir, "ingest.log")
  const summary = {
    blogId,
    outputDir: resolvedOutputDir,
    manifestPath,
    totalPosts: manifest.totalPosts,
    successCount: manifest.successCount,
    failureCount: manifest.failureCount,
    assetMode: options.assets.imageHandlingMode,
    imageDownloadsDisabled: !options.assets.downloadImages && !options.assets.downloadThumbnails,
    downloadedAssetFileCount: downloadedAssetFiles.length,
    downloadedAssetFiles,
    failedPosts: failedPostReports,
    failureGroups,
  }

  await writeJson({
    targetPath: failureSummaryJsonPath,
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
  await writeFile(logPath, `${logs.join("\n")}${logs.length > 0 ? "\n" : ""}`, "utf8")

  console.log(
    [
      `blogId: ${blogId}`,
      `outputDir: ${resolvedOutputDir}`,
      `manifestPath: ${manifestPath}`,
      `failureSummaryJsonPath: ${failureSummaryJsonPath}`,
      `failureSummaryMarkdownPath: ${failureSummaryMarkdownPath}`,
      `failureCount: ${manifest.failureCount}`,
      `failureGroupCount: ${failureGroups.length}`,
      `downloadedAssetFileCount: ${downloadedAssetFiles.length}`,
    ].join("\n"),
  )

  if (manifest.failureCount > 0 || downloadedAssetFiles.length > 0) {
    process.exitCode = 1
  }
}

try {
  await run()
} catch (error) {
  console.error(toErrorMessage(error))
  process.exitCode = 1
}
