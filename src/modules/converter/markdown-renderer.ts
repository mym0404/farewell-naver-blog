import { load } from "cheerio"
import YAML from "yaml"

import { convertHtmlToMarkdown } from "./html-fragment-converter.js"

import type {
  AssetRecord,
  AstBlock,
  CategoryInfo,
  ExportOptions,
  FrontmatterFieldName,
  ImageData,
  UnknownRecord,
  ParsedPost,
  PostSummary,
} from "../../shared/types.js"
import { resolveBlockOutputSelection } from "../../shared/block-registry.js"
import {
  buildDiagnosticsSection,
  createLinkFormatter,
  getDividerMarker,
  getHeadingLevelOffset,
  getHtmlConversionOptions,
  type RenderDiagnostic,
  renderCodeBlock,
  renderFormula,
  renderGfmTable,
  renderImageBlockMarkdown,
  renderLinkCardBlock,
  renderParagraph,
  renderQuote,
} from "../../shared/block-markdown.js"
import { getFrontmatterExportKey } from "../../shared/export-options.js"
import { getParserCapabilityId } from "../../shared/parser-capabilities.js"
import { compactText, unique } from "../../shared/utils.js"

const extractFallbackText = ({
  html,
  htmlConversionOptions,
  resolveLinkUrl,
}: {
  html: string
  htmlConversionOptions: {
    linkStyle: ExportOptions["markdown"]["linkStyle"]
    dividerMarker: "---" | "***"
  }
  resolveLinkUrl?: (url: string) => string
}) => {
  const convertedMarkdown = convertHtmlToMarkdown({
    html,
    options: htmlConversionOptions,
    resolveLinkUrl,
  }).trim()

  if (convertedMarkdown) {
    return convertedMarkdown
  }

  return compactText(load(html).text())
}


const buildFrontmatter = ({
  fields,
  aliases,
  values,
}: {
  fields: Record<FrontmatterFieldName, boolean>
  aliases: Record<FrontmatterFieldName, string>
  values: Record<FrontmatterFieldName, unknown>
}) => {
  const frontmatter: UnknownRecord = {}

  for (const [key, enabled] of Object.entries(fields) as Array<[FrontmatterFieldName, boolean]>) {
    if (!enabled) {
      continue
    }

    const value = values[key]

    if (value === undefined || value === null) {
      continue
    }

    if (Array.isArray(value) && value.length === 0) {
      continue
    }

    const alias = getFrontmatterExportKey({
      fieldName: key,
      alias: aliases[key],
    })

    frontmatter[alias] = value
  }

  return frontmatter
}

export const renderMarkdownPost = async ({
  post,
  category,
  parsedPost,
  markdownFilePath,
  reviewedWarnings,
  options,
  resolveAsset,
  resolveLinkUrl,
}: {
  post: PostSummary
  category: CategoryInfo
  parsedPost: ParsedPost
  markdownFilePath: string
  reviewedWarnings: string[]
  options: ExportOptions
  resolveAsset: (input: {
    kind: "image" | "thumbnail"
    sourceUrl: string
    markdownFilePath: string
  }) => Promise<AssetRecord>
  resolveLinkUrl?: (url: string) => string
}) => {
  const initialWarnings = unique([...parsedPost.warnings, ...reviewedWarnings])
  const warnings: string[] = [...initialWarnings]
  const diagnostics: RenderDiagnostic[] = initialWarnings.map((warning) => ({
    level: "warning",
    message: warning,
  }))
  const assetRecords: AssetRecord[] = []
  const sections: string[] = []
  const linkFormatter = createLinkFormatter({
    style: options.markdown.linkStyle,
    resolveLinkUrl,
  })
  const htmlConversionOptions = getHtmlConversionOptions({
    linkStyle: options.markdown.linkStyle,
    dividerSelection: resolveBlockOutputSelection({
      blockType: "divider",
      blockOutputs: options.blockOutputs,
    }),
  })
  const renderedVideos: Array<{
    title: string
    sourceUrl: string
    thumbnail: string | null
  }> = []
  let postListThumbnailPath: string | null = null
  let firstBodyThumbnailPath: string | null = null

  const resolveAssetPath = async ({
    kind,
    sourceUrl,
  }: {
    kind: "image" | "thumbnail"
    sourceUrl: string
  }): Promise<string | null> => {
    try {
      const assetRecord = await resolveAsset({
        kind,
        sourceUrl,
        markdownFilePath,
      })

      if (
        !assetRecords.some(
          (existing) =>
            existing.reference === assetRecord.reference &&
            existing.storageMode === assetRecord.storageMode,
        )
      ) {
        assetRecords.push(assetRecord)
      }

      return assetRecord.reference
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const warning = `자산 다운로드 실패: ${sourceUrl} (${message})`
      const shouldWarn =
        options.assets.downloadFailureMode === "warn-and-use-source" ||
        options.assets.downloadFailureMode === "warn-and-omit"

      if (shouldWarn) {
        warnings.push(warning)
        diagnostics.push({
          level: "warning",
          message: warning,
        })
      }

      return options.assets.downloadFailureMode === "warn-and-omit" ||
        options.assets.downloadFailureMode === "omit"
        ? null
        : sourceUrl
    }
  }

  if (options.assets.thumbnailSource === "post-list-first" && post.thumbnailUrl) {
    postListThumbnailPath = await resolveAssetPath({
      kind: "thumbnail",
      sourceUrl: post.thumbnailUrl,
    })
  }

  const maybeRecordBodyThumbnail = (pathValue: string | null) => {
    if (!firstBodyThumbnailPath && pathValue) {
      firstBodyThumbnailPath = pathValue
    }
  }

  const getRenderableImageSource = (image: ImageData) => {
    if (image.mediaKind === "sticker") {
      if (options.assets.stickerAssetMode === "ignore") {
        return null
      }

      return image.originalSourceUrl || image.sourceUrl
    }

    return image.sourceUrl
  }

  const renderImageBlock = async ({ image }: { image: ImageData }) => {
    const renderableSourceUrl = getRenderableImageSource(image)

    if (!renderableSourceUrl) {
      return ""
    }

    const assetPath = await resolveAssetPath({
      kind: "image",
      sourceUrl: renderableSourceUrl,
    })

    if (!assetPath) {
      return ""
    }

    maybeRecordBodyThumbnail(assetPath)

    const imageSelection = resolveBlockOutputSelection({
      blockType: "image",
      capabilityId: getParserCapabilityId({
        editorVersion: parsedPost.editorVersion,
        blockType: "image",
      }),
      blockOutputs: options.blockOutputs,
    })
    return renderImageBlockMarkdown({
      image: {
        ...image,
        originalSourceUrl: renderableSourceUrl,
      },
      assetPath,
      selection: imageSelection,
      formatLink: linkFormatter.formatLink,
      includeImageCaptions: options.assets.includeImageCaptions,
    })
  }

  const renderVideoBlock = async (block: Extract<AstBlock, { type: "video" }>) => {
    renderedVideos.push({
      title: block.video.title,
      sourceUrl: block.video.sourceUrl,
      thumbnail: block.video.thumbnailUrl,
    })

    return linkFormatter.formatLink({
      label: block.video.title || block.video.sourceUrl,
      url: block.video.sourceUrl,
    })
  }

  const renderTableBlock = (block: Extract<AstBlock, { type: "table" }>) => {
    const capabilityId = getParserCapabilityId({
      editorVersion: parsedPost.editorVersion,
      blockType: "table",
    })
    const selection = resolveBlockOutputSelection({
      blockType: "table",
      capabilityId,
      blockOutputs: options.blockOutputs,
    })

    if (selection.variant === "html-only") {
      return block.html
    }

    if (block.rows.length > 0) {
      return renderGfmTable(block)
    }

    return convertHtmlToMarkdown({
      html: block.html,
      options: htmlConversionOptions,
      resolveLinkUrl,
    })
  }

  for (const block of parsedPost.blocks) {
    const capabilityId = getParserCapabilityId({
      editorVersion: parsedPost.editorVersion,
      blockType: block.type,
    })
    const selection = resolveBlockOutputSelection({
      blockType: block.type,
      capabilityId,
      blockOutputs: options.blockOutputs,
    })

    if (block.type === "paragraph") {
      sections.push(renderParagraph(block.text))
      continue
    }

    if (block.type === "heading") {
      const adjustedLevel = Math.min(
        Math.max(block.level + getHeadingLevelOffset(selection), 1),
        6,
      )

      sections.push(`${"#".repeat(adjustedLevel)} ${block.text}`)
      continue
    }

    if (block.type === "quote") {
      sections.push(renderQuote(block.text))
      continue
    }

    if (block.type === "divider") {
      sections.push(getDividerMarker(selection))
      continue
    }

    if (block.type === "code") {
      sections.push(
        renderCodeBlock({
          language: block.language,
          code: block.code,
          variant: selection.variant,
        }),
      )
      continue
    }

    if (block.type === "formula") {
      sections.push(
        renderFormula({
          formula: block.formula,
          display: block.display,
          selection,
        }),
      )
      continue
    }

    if (block.type === "image") {
      sections.push(await renderImageBlock({ image: block.image }))
      continue
    }

    if (block.type === "imageGroup") {
      const groupSections: string[] = []

      for (const image of block.images) {
        groupSections.push(await renderImageBlock({ image }))
      }

      sections.push(groupSections.join("\n\n"))
      continue
    }

    if (block.type === "video") {
      sections.push(await renderVideoBlock(block))
      continue
    }

    if (block.type === "linkCard") {
      sections.push(
        renderLinkCardBlock({
          block,
          formatLink: linkFormatter.formatLink,
        }),
      )
      continue
    }

    if (block.type === "table") {
      sections.push(renderTableBlock(block))
      continue
    }

    if (block.type === "rawHtml") {
      const extractedText = extractFallbackText({
        html: block.html,
        htmlConversionOptions,
        resolveLinkUrl,
      })

      if (selection.variant === "omit") {
        const message = `raw HTML 블록을 생략했습니다: ${block.reason}`

        warnings.push(message)
        diagnostics.push({
          level: extractedText ? "warning" : "error",
          message,
          detail: extractedText || undefined,
        })
        continue
      }

      if (!extractedText) {
        const message = `raw HTML 블록을 생략했습니다: ${block.reason}`

        warnings.push(message)
        diagnostics.push({
          level: "error",
          message,
        })
        continue
      }

      const message = `raw HTML 블록을 Markdown으로 변환했습니다: ${block.reason}`

      warnings.push(message)
      diagnostics.push({
        level: "warning",
        message,
        detail: extractedText,
      })
      sections.push(extractedText)
    }
  }

  const thumbnailPath =
    options.assets.thumbnailSource === "none"
      ? null
      : options.assets.thumbnailSource === "first-body-image"
        ? firstBodyThumbnailPath
        : postListThumbnailPath ?? firstBodyThumbnailPath

  const frontmatterValues: Record<FrontmatterFieldName, unknown> = {
    title: post.title,
    source: post.source,
    blogId: post.blogId,
    logNo: Number(post.logNo),
    publishedAt: post.publishedAt,
    category: category.name,
    categoryPath: category.path,
    editorVersion: parsedPost.editorVersion,
    visibility: "public",
    tags: parsedPost.tags,
    thumbnail: thumbnailPath,
    video: renderedVideos,
    warnings: unique(warnings),
    exportedAt: new Date().toISOString(),
    assetPaths: assetRecords
      .map((asset) => asset.relativePath)
      .filter((assetPath): assetPath is string => Boolean(assetPath)),
  }

  const frontmatter = options.frontmatter.enabled
    ? buildFrontmatter({
        fields: options.frontmatter.fields,
        aliases: options.frontmatter.aliases,
        values: frontmatterValues,
      })
    : null

  const bodySections = sections.filter(Boolean).join("\n\n").trim()
  const diagnosticsSection = buildDiagnosticsSection(diagnostics)
  const referenceSection = linkFormatter.renderReferenceSection()
  const body = [diagnosticsSection, bodySections, referenceSection].filter(Boolean).join("\n\n")

  const markdown = frontmatter
    ? `---\n${YAML.stringify(frontmatter)}---\n\n${body}\n`
    : `${body}\n`

  return {
    markdown,
    assetRecords,
    warnings: unique(warnings),
  }
}
