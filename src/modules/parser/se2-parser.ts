import type { CheerioAPI } from "cheerio"

import { convertHtmlToMarkdown, sanitizeHtmlFragment } from "../converter/html-fragment-converter.js"
import type { AstBlock, ExportOptions, ImageData, ParsedPost } from "../../shared/types.js"
import { compactText, unique } from "../../shared/utils.js"
import { parseHtmlTable } from "./table-parser.js"

const getStandaloneImages = ({
  $,
  element,
}: {
  $: CheerioAPI
  element: ReturnType<CheerioAPI>
}) => {
  const images = $(element)
    .find("img")
    .toArray()
    .map((imageNode): ImageData | null => {
      const $image = $(imageNode)
      const sourceUrl = $image.attr("src") ?? ""

      if (!sourceUrl) {
        return null
      }

      return {
        sourceUrl,
        alt: $image.attr("alt") ?? "",
        caption: null,
      } satisfies ImageData
    })
    .filter((image): image is ImageData => image !== null)

  const textWithoutImages = compactText(
    $(element)
      .clone()
      .find("img")
      .remove()
      .end()
      .text(),
  )

  return textWithoutImages ? [] : images
}

export const parseSe2Post = ({
  $,
  tags,
  options,
}: {
  $: CheerioAPI
  tags: string[]
  options: Pick<ExportOptions, "markdown">
}) => {
  const warnings: string[] = []
  const blocks: AstBlock[] = []
  const container = $("#viewTypeSelector").first()

  container.contents().toArray().forEach((node) => {
    if (node.type === "text") {
      const text = compactText(node.data ?? "")

      if (text) {
        blocks.push({ type: "paragraph", text })
      }
      return
    }

    if (node.type !== "tag") {
      return
    }

    const element = $(node)
    const tagName = node.tagName.toLowerCase()
    const standaloneImages = getStandaloneImages({ $, element })

    if (tagName === "table") {
      const parsedTable = parseHtmlTable({ $, table: element })
      blocks.push({
        type: "table",
        rows: parsedTable.rows,
        html: parsedTable.html,
        complex: parsedTable.complex,
      })
      return
    }

    if (tagName === "hr") {
      blocks.push({ type: "divider" })
      return
    }

    if (tagName === "blockquote") {
      const markdown = convertHtmlToMarkdown({
        html: element.html() ?? "",
        options,
      })

      if (markdown) {
        blocks.push({ type: "quote", text: markdown })
      }
      return
    }

    if (/^h[1-6]$/.test(tagName)) {
      const level = Number(tagName[1])
      const text = compactText(
        convertHtmlToMarkdown({
          html: element.html() ?? "",
          options,
        }),
      )

      if (text) {
        blocks.push({ type: "heading", level, text })
      }
      return
    }

    if (tagName === "pre") {
      const code = element.text().trimEnd()

      if (code) {
        blocks.push({ type: "code", language: null, code })
      }
      return
    }

    if (standaloneImages.length === 1) {
      blocks.push({ type: "image", image: standaloneImages[0] })
      return
    }

    if (standaloneImages.length > 1) {
      blocks.push({ type: "imageGroup", images: standaloneImages })
      return
    }

    const html = sanitizeHtmlFragment($.html(element) ?? "")
    const markdown = convertHtmlToMarkdown({
      html,
      options,
    })

    if (markdown) {
      blocks.push({ type: "paragraph", text: markdown })
      return
    }

    if (!html) {
      return
    }

    const text = compactText(element.text())

    if (text) {
      warnings.push(`SE2 블록을 구조화하지 못해 텍스트로 축약했습니다: <${tagName}>`)
      blocks.push({
        type: "paragraph",
        text,
      })
      return
    }

    warnings.push(`SE2 블록을 해석하지 못해 raw HTML로 남겼습니다: <${tagName}>`)
    blocks.push({
      type: "rawHtml",
      html,
      reason: `se2:${tagName}`,
    })
  })

  const videos = blocks
    .filter((block): block is Extract<AstBlock, { type: "video" }> => block.type === "video")
    .map((block) => block.video)

  return {
    editorVersion: 2,
    tags: unique(tags),
    blocks,
    warnings: unique(warnings),
    videos,
  } satisfies ParsedPost
}
