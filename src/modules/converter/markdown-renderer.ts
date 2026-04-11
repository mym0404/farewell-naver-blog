import YAML from "yaml"

import { convertHtmlToMarkdown } from "./html-fragment-converter.js"

import type {
  AssetRecord,
  AstBlock,
  CategoryInfo,
  ExportOptions,
  FrontmatterFieldName,
  ParsedPost,
  PostSummary,
} from "../../shared/types.js"
import { getFrontmatterExportKey } from "../../shared/export-options.js"
import { unique } from "../../shared/utils.js"

const escapeTableCell = (value: string) =>
  value.replace(/\|/g, "\\|").replace(/\n+/g, "<br>").trim() || " "

const createLinkFormatter = ({
  style,
}: {
  style: ExportOptions["markdown"]["linkStyle"]
}) => {
  const references: string[] = []
  const referenceMap = new Map<string, string>()

  const getReferenceId = ({
    label,
    url,
  }: {
    label: string
    url: string
  }) => {
    const key = `${label}\u0000${url}`
    const existing = referenceMap.get(key)

    if (existing) {
      return existing
    }

    const nextId = `ref-${referenceMap.size + 1}`

    referenceMap.set(key, nextId)
    references.push(`[${nextId}]: ${url}`)

    return nextId
  }

  const formatLink = ({
    label,
    url,
  }: {
    label: string
    url: string
  }) => {
    if (style === "inlined") {
      return `[${label}](${url})`
    }

    return `[${label}][${getReferenceId({ label, url })}]`
  }

  return {
    formatLink,
    renderReferenceSection: () => (references.length > 0 ? references.join("\n") : ""),
  }
}

const isDegenerateMarkdownLine = (line: string) => /^[*_~`]+$/.test(line.trim())

const normalizeMarkdownText = (text: string) =>
  text
    .replace(/([^\s*])\*{4,}([^\s*])/g, "$1**$2")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() && !isDegenerateMarkdownLine(line))
    .join("\n")
    .trim()

const renderParagraph = (text: string) => normalizeMarkdownText(text)

const renderQuote = (text: string) =>
  text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n")

const renderCodeBlock = ({
  language,
  code,
  style,
}: {
  language: string | null
  code: string
  style: ExportOptions["markdown"]["codeFenceStyle"]
}) => {
  const fence = style === "tilde" ? "~~~" : "```"

  return `${fence}${language ?? ""}\n${code}\n${fence}`
}

const renderFormulaBlock = ({
  formula,
  style,
}: {
  formula: string
  style: ExportOptions["markdown"]["formulaStyle"]
}) => {
  if (style === "math-fence") {
    return `\`\`\`math\n${formula}\n\`\`\``
  }

  return `$$\n${formula}\n$$`
}

const renderLinkCardBlock = ({
  block,
  options,
  formatLink,
}: {
  block: Extract<AstBlock, { type: "linkCard" }>
  options: Pick<ExportOptions, "markdown">
  formatLink: (input: { label: string; url: string }) => string
}) => {
  const title = block.card.title || block.card.url
  const description = normalizeMarkdownText(block.card.description)
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim()

      if (!trimmed) {
        return false
      }

      if (/^[()]+$/.test(trimmed)) {
        return false
      }

      if (trimmed === block.card.url) {
        return false
      }

      return true
    })
    .join("\n")

  if (options.markdown.linkCardStyle === "quote") {
    return [title, description, block.card.url]
      .filter(Boolean)
      .map((line) => `> ${line}`)
      .join("\n")
  }

  if (options.markdown.linkCardStyle === "html") {
    return [formatLink({ label: title, url: block.card.url }), description, block.card.url]
      .filter(Boolean)
      .join("\n")
  }

  return [formatLink({ label: title, url: block.card.url }), description, block.card.url]
    .filter(Boolean)
    .join("\n")
}

const renderGfmTable = (block: Extract<AstBlock, { type: "table" }>) => {
  const [headerRow, ...bodyRows] = block.rows

  if (!headerRow) {
    return block.html
  }

  const columnCount = headerRow.length
  const normalizeRow = (cells: typeof headerRow) =>
    [
      ...cells.map((cell) => escapeTableCell(cell.text)),
      ...Array.from({ length: Math.max(0, columnCount - cells.length) }, () => " "),
    ].slice(0, columnCount)

  const lines = [
    `| ${normalizeRow(headerRow).join(" | ")} |`,
    `| ${Array.from({ length: columnCount }, () => "---").join(" | ")} |`,
    ...bodyRows.map((row) => `| ${normalizeRow(row).join(" | ")} |`),
  ]

  return lines.join("\n")
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
  const frontmatter: Record<string, unknown> = {}

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
}: {
  post: PostSummary
  category: CategoryInfo
  parsedPost: ParsedPost
  markdownFilePath: string
  reviewedWarnings: string[]
  options: ExportOptions
  resolveAsset: (input: {
    kind: "image" | "thumbnail"
    postLogNo: string
    sourceUrl: string
    markdownFilePath: string
  }) => Promise<AssetRecord>
}) => {
  const warnings: string[] = [...reviewedWarnings]
  const assetRecords: AssetRecord[] = []
  const sections: string[] = []
  const linkFormatter = createLinkFormatter({
    style: options.markdown.linkStyle,
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
  }) => {
    try {
      const assetRecord = await resolveAsset({
        kind,
        postLogNo: post.logNo,
        sourceUrl,
        markdownFilePath,
      })

      if (!assetRecords.some((existing) => existing.relativePath === assetRecord.relativePath)) {
        assetRecords.push(assetRecord)
      }

      return assetRecord.relativePath
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      warnings.push(`자산 다운로드 실패: ${sourceUrl} (${message})`)
      return sourceUrl
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

  const renderImageBlock = async ({
    sourceUrl,
    alt,
    caption,
  }: {
    sourceUrl: string
    alt: string
    caption: string | null
  }) => {
    const assetPath = await resolveAssetPath({
      kind: "image",
      sourceUrl,
    })

    maybeRecordBodyThumbnail(assetPath)

    const safeLabel = alt || caption || "Image"
    const lines: string[] = []

    if (options.markdown.imageStyle === "source-only") {
      lines.push(
        linkFormatter.formatLink({
          label: safeLabel,
          url: assetPath,
        }),
      )
    } else {
      const imageMarkdown = `![${alt}](${assetPath})`
      const content =
        options.markdown.imageStyle === "linked-image"
          ? linkFormatter.formatLink({
              label: imageMarkdown,
              url: sourceUrl,
            })
          : imageMarkdown

      lines.push(content)
    }

    if (options.assets.includeImageCaptions && caption) {
      lines.push(`_${caption}_`)
    }

    return lines.join("\n\n")
  }

  const renderVideoBlock = async (block: Extract<AstBlock, { type: "video" }>) => {
    const thumbnailPath = block.video.thumbnailUrl
      ? await resolveAssetPath({
          kind: "thumbnail",
          sourceUrl: block.video.thumbnailUrl,
        })
      : null

    maybeRecordBodyThumbnail(thumbnailPath)
    renderedVideos.push({
      title: block.video.title,
      sourceUrl: block.video.sourceUrl,
      thumbnail: thumbnailPath,
    })

    if (options.markdown.videoStyle === "html") {
      warnings.push("video html 옵션은 지원하지 않아 Markdown 링크 형식으로 변환했습니다.")
    }

    if (options.markdown.videoStyle === "link-only") {
      return [
        `**Video:** ${block.video.title}`,
        linkFormatter.formatLink({
          label: "Open Original Post",
          url: block.video.sourceUrl,
        }),
      ].join("\n\n")
    }

    const lines: string[] = []

    if (thumbnailPath) {
      lines.push(`![${block.video.title}](${thumbnailPath})`)
    }

    lines.push(`**Video:** ${block.video.title}`)
    lines.push(
      linkFormatter.formatLink({
        label: "Open Original Post",
        url: block.video.sourceUrl,
      }),
    )

    return lines.join("\n\n")
  }

  const renderTableBlock = (block: Extract<AstBlock, { type: "table" }>) => {
    if (block.rows.length > 0) {
      return renderGfmTable(block)
    }

    return convertHtmlToMarkdown({
      html: block.html,
      options,
    })
  }

  for (const block of parsedPost.blocks) {
    if (block.type === "paragraph") {
      sections.push(renderParagraph(block.text))
      continue
    }

    if (block.type === "heading") {
      const adjustedLevel = Math.min(
        Math.max(block.level + options.markdown.headingLevelOffset, 1),
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
      sections.push(options.markdown.dividerStyle === "asterisk" ? "***" : "---")
      continue
    }

    if (block.type === "code") {
      sections.push(
        renderCodeBlock({
          language: block.language,
          code: block.code,
          style: options.markdown.codeFenceStyle,
        }),
      )
      continue
    }

    if (block.type === "formula") {
      sections.push(
        renderFormulaBlock({
          formula: block.formula,
          style: options.markdown.formulaStyle,
        }),
      )
      continue
    }

    if (block.type === "image") {
      sections.push(
        await renderImageBlock({
          sourceUrl: block.image.sourceUrl,
          alt: block.image.alt,
          caption: block.image.caption,
        }),
      )
      continue
    }

    if (block.type === "imageGroup") {
      if (options.markdown.imageGroupStyle === "html") {
        warnings.push("imageGroup html 옵션은 지원하지 않아 개별 이미지 Markdown으로 변환했습니다.")
      }

      const groupSections: string[] = []

      for (const image of block.images) {
        groupSections.push(
          await renderImageBlock({
            sourceUrl: image.sourceUrl,
            alt: image.alt,
            caption: image.caption,
          }),
        )
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
          options,
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
      if (options.markdown.rawHtmlPolicy === "omit") {
        warnings.push(`raw HTML 블록을 생략했습니다: ${block.reason}`)
        continue
      }

      const convertedMarkdown = convertHtmlToMarkdown({
        html: block.html,
        options,
      })

      if (!convertedMarkdown) {
        warnings.push(`raw HTML 블록을 생략했습니다: ${block.reason}`)
        continue
      }

      warnings.push(`raw HTML 블록을 Markdown으로 변환했습니다: ${block.reason}`)
      sections.push(convertedMarkdown)
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
    assetPaths: assetRecords.map((asset) => asset.relativePath),
  }

  const frontmatter = options.frontmatter.enabled
    ? buildFrontmatter({
        fields: options.frontmatter.fields,
        aliases: options.frontmatter.aliases,
        values: frontmatterValues,
      })
    : null

  const bodySections = sections.filter(Boolean).join("\n\n").trim()
  const referenceSection = linkFormatter.renderReferenceSection()
  const body = [bodySections, referenceSection].filter(Boolean).join("\n\n")

  const markdown = frontmatter
    ? `---\n${YAML.stringify(frontmatter)}---\n\n${body}\n`
    : `${body}\n`

  return {
    markdown,
    assetRecords,
    warnings: unique(warnings),
  }
}
