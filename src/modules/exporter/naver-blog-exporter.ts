import path from "node:path"
import { writeFile } from "node:fs/promises"

import { cloneExportOptions } from "../../shared/export-options.js"
import type {
  CategoryInfo,
  ExportManifest,
  ExportOptions,
  ExportRequest,
  PostManifestEntry,
  PostSummary,
} from "../../shared/types.js"
import {
  ensureDir,
  extractBlogId,
  getDateSlug,
  recreateDir,
  sanitizeCategoryName,
  sanitizePathSegment,
  slugifyTitle,
  toErrorMessage,
} from "../../shared/utils.js"
import { NaverBlogFetcher } from "../blog-fetcher/naver-blog-fetcher.js"
import { renderMarkdownPost } from "../converter/markdown-renderer.js"
import { parsePostHtml } from "../parser/post-parser.js"
import { reviewParsedPost } from "../reviewer/post-reviewer.js"
import { AssetStore } from "./asset-store.js"

const getCategoryForPost = ({
  categories,
  categoryId,
  categoryName,
}: {
  categories: Map<number, CategoryInfo>
  categoryId: number
  categoryName: string
}) => {
  const matchedCategory = categories.get(categoryId)

  if (matchedCategory) {
    return matchedCategory
  }

  return {
    id: categoryId,
    name: sanitizeCategoryName(categoryName) || "Uncategorized",
    parentId: null,
    postCount: 0,
    isDivider: false,
    isOpen: true,
    path: [sanitizeCategoryName(categoryName) || "Uncategorized"],
    depth: 0,
  } satisfies CategoryInfo
}

const resolveSelectedCategoryIds = ({
  categories,
  options,
}: {
  categories: CategoryInfo[]
  options: ExportOptions
}) => {
  if (options.scope.categoryIds.length === 0) {
    return new Set<number>()
  }

  if (options.scope.categoryMode === "exact-selected") {
    return new Set(options.scope.categoryIds)
  }

  const selectedSet = new Set(options.scope.categoryIds)
  const resolved = new Set<number>(options.scope.categoryIds)

  for (const category of categories) {
    if (category.path.length === 0) {
      continue
    }

    const matchesAncestor = options.scope.categoryIds.some((selectedId) => {
      if (!selectedSet.has(selectedId)) {
        return false
      }

      const selectedCategory = categories.find((item) => item.id === selectedId)

      if (!selectedCategory) {
        return false
      }

      return selectedCategory.path.every((segment, index) => category.path[index] === segment)
    })

    if (matchesAncestor) {
      resolved.add(category.id)
    }
  }

  return resolved
}

const filterPosts = ({
  posts,
  categories,
  options,
}: {
  posts: PostSummary[]
  categories: CategoryInfo[]
  options: ExportOptions
}) => {
  const selectedCategoryIds = resolveSelectedCategoryIds({
    categories,
    options,
  })
  const from = options.scope.dateFrom ? `${options.scope.dateFrom}T00:00:00+09:00` : null
  const to = options.scope.dateTo ? `${options.scope.dateTo}T23:59:59+09:00` : null

  return posts.filter((post) => {
    const inCategory =
      selectedCategoryIds.size === 0 || selectedCategoryIds.has(post.categoryId)
    const inDateRange =
      (!from || post.publishedAt >= from) &&
      (!to || post.publishedAt <= to)

    return inCategory && inDateRange
  })
}

const buildMarkdownFilePath = ({
  outputDir,
  post,
  category,
  options,
}: {
  outputDir: string
  post: PostSummary
  category: CategoryInfo
  options: ExportOptions
}) => {
  const segments = [
    outputDir,
    options.structure.postDirectoryName,
  ]

  if (options.structure.folderStrategy === "category-path") {
    const categorySegments = (category.path.length > 0 ? category.path : [category.name]).map(
      sanitizePathSegment,
    )

    segments.push(...categorySegments)
  }

  const nameParts: string[] = []

  if (options.structure.includeDateInFilename) {
    nameParts.push(getDateSlug(post.publishedAt))
  }

  if (options.structure.includeLogNoInFilename) {
    nameParts.push(post.logNo)
  }

  if (options.structure.slugStyle === "kebab") {
    nameParts.push(slugifyTitle(post.title))
  } else {
    nameParts.push(sanitizePathSegment(post.title))
  }

  const fileName = `${nameParts.filter(Boolean).join("-") || post.logNo}.md`

  return path.join(...segments, fileName)
}

export class NaverBlogExporter {
  readonly request: ExportRequest
  readonly onLog: (message: string) => void
  readonly onProgress: (progress: {
    total: number
    completed: number
    failed: number
    warnings: number
  }) => void

  constructor({
    request,
    onLog,
    onProgress,
  }: {
    request: ExportRequest
    onLog: (message: string) => void
    onProgress: (progress: {
      total: number
      completed: number
      failed: number
      warnings: number
    }) => void
  }) {
    this.request = request
    this.onLog = onLog
    this.onProgress = onProgress
  }

  async run() {
    const blogId = extractBlogId(this.request.blogIdOrUrl)
    const outputDir = path.resolve(this.request.outputDir)
    const options = cloneExportOptions(this.request.options)
    const fetcher = new NaverBlogFetcher({
      blogId,
      onLog: (message) => this.onLog(message),
    })
    const assetStore = new AssetStore({
      outputDir,
      fetcher,
      options,
    })

    if (options.structure.cleanOutputDir) {
      await recreateDir(outputDir)
      this.onLog(`출력 디렉터리 초기화 완료: ${outputDir}`)
    } else {
      await ensureDir(outputDir)
      this.onLog(`출력 디렉터리 유지: ${outputDir}`)
    }

    const [scan, posts] = await Promise.all([
      fetcher.scanBlog(),
      fetcher.getAllPosts(),
    ])
    const categoryMap = new Map(scan.categories.map((category) => [category.id, category]))
    const filteredPosts = filterPosts({
      posts,
      categories: scan.categories,
      options,
    })
    const manifest: ExportManifest = {
      blogId,
      profile: this.request.profile,
      options,
      selectedCategoryIds: options.scope.categoryIds,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      totalPosts: filteredPosts.length,
      successCount: 0,
      failureCount: 0,
      warningCount: 0,
      categories: scan.categories,
      posts: [],
    }
    let completed = 0
    let failed = 0
    let warningCount = 0

    if (posts.length !== scan.totalPostCount) {
      this.onLog(
        `목록 수집 수와 API 총계가 다릅니다. collected=${posts.length}, expected=${scan.totalPostCount}`,
      )
    }

    this.onLog(`필터 적용 후 export 대상 글 수: ${filteredPosts.length}`)

    for (const post of filteredPosts) {
      const category = getCategoryForPost({
        categories: categoryMap,
        categoryId: post.categoryId,
        categoryName: post.categoryName,
      })

      try {
        this.onLog(`글 수집 시작: ${post.logNo} ${post.title}`)
        const html = await fetcher.fetchPostHtml(post.logNo)
        const parsedPost = parsePostHtml({
          html,
          sourceUrl: post.source,
          options,
        })
        const review = reviewParsedPost(parsedPost)
        const markdownFilePath = buildMarkdownFilePath({
          outputDir,
          post,
          category,
          options,
        })
        const rendered = await renderMarkdownPost({
          post,
          category,
          parsedPost,
          markdownFilePath,
          reviewedWarnings: review.warnings,
          options,
          resolveAsset: async (input) => assetStore.saveAsset(input),
        })

        await ensureDir(path.dirname(markdownFilePath))
        await writeFile(markdownFilePath, rendered.markdown, "utf8")
        completed += 1
        warningCount += rendered.warnings.length
        manifest.successCount = completed
        manifest.warningCount = warningCount
        manifest.posts.push({
          logNo: post.logNo,
          title: post.title,
          source: post.source,
          category: {
            id: category.id,
            name: category.name,
            path: category.path,
          },
          editorVersion: parsedPost.editorVersion,
          status: "success",
          outputPath: path.relative(outputDir, markdownFilePath).split(path.sep).join("/"),
          assetPaths: rendered.assetRecords.map((asset) => asset.relativePath),
          warnings: rendered.warnings,
          error: null,
        } satisfies PostManifestEntry)
        this.onProgress({
          total: filteredPosts.length,
          completed,
          failed,
          warnings: warningCount,
        })
      } catch (error) {
        failed += 1
        manifest.failureCount = failed
        manifest.posts.push({
          logNo: post.logNo,
          title: post.title,
          source: post.source,
          category: {
            id: category.id,
            name: category.name,
            path: category.path,
          },
          editorVersion: post.editorVersion,
          status: "failed",
          outputPath: null,
          assetPaths: [],
          warnings: [],
          error: toErrorMessage(error),
        } satisfies PostManifestEntry)
        this.onLog(`글 export 실패: ${post.logNo} (${toErrorMessage(error)})`)
        this.onProgress({
          total: filteredPosts.length,
          completed,
          failed,
          warnings: warningCount,
        })
      }
    }

    manifest.finishedAt = new Date().toISOString()
    await writeFile(
      path.join(outputDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf8",
    )
    this.onLog(`manifest 저장 완료: ${path.join(outputDir, "manifest.json")}`)

    return manifest
  }
}
