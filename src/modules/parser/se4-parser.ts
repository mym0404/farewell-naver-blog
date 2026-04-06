import type { CheerioAPI } from "cheerio"
import { load } from "cheerio"

import { convertHtmlToMarkdown } from "../converter/html-fragment-converter.js"
import type {
  AstBlock,
  ExportOptions,
  ImageData,
  ParsedPost,
  VideoData,
} from "../../shared/types.js"
import { compactText, normalizeAssetUrl, unique } from "../../shared/utils.js"
import { parseHtmlTable } from "./table-parser.js"

const parseJsonAttribute = (value: string | undefined) => {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as Record<string, unknown>
  } catch {
    return null
  }
}

const getComponentModule = ($component: ReturnType<CheerioAPI>) => {
  const moduleScript = $component.find("script.__se_module_data").first()

  return (
    parseJsonAttribute(moduleScript.attr("data-module-v2")) ??
    parseJsonAttribute(moduleScript.attr("data-module"))
  )
}

const getComponentHtml = ({
  $,
  $component,
}: {
  $: CheerioAPI
  $component: ReturnType<CheerioAPI>
}) => {
  const clone = $component.clone()
  clone.find("script.__se_module_data").remove()

  return $.html(clone).trim()
}

const parseImageLink = ($link: ReturnType<CheerioAPI>) => {
  const linkData = parseJsonAttribute($link.attr("data-linkdata"))
  const imageNode = $link.find("img").first()
  const sourceUrl = [
    imageNode.attr("data-lazy-src"),
    imageNode.attr("src"),
    typeof linkData?.src === "string" ? linkData.src : null,
  ]
    .find((candidate): candidate is string => Boolean(candidate?.trim()))
    ?.trim()

  const caption = compactText($link.closest(".se-component").find(".se-image-caption").text()) || null

  if (!sourceUrl) {
    return null
  }

  return {
    sourceUrl: normalizeAssetUrl(sourceUrl),
    alt: imageNode.attr("alt") ?? "",
    caption,
  } satisfies ImageData
}

const parseTextBlocks = ({
  $component,
  options,
}: {
  $component: ReturnType<CheerioAPI>
  options: Pick<ExportOptions, "markdown">
}) =>
  $component
    .find("p.se-text-paragraph")
    .toArray()
    .map((paragraph) =>
      convertHtmlToMarkdown({
        html: $component.find(paragraph).html() ?? "",
        options,
      }),
    )
    .map((text) => compactText(text))
    .filter(Boolean)
    .map(
      (text) =>
        ({
          type: "paragraph",
          text,
        }) satisfies AstBlock,
    )

const parseQuoteBlock = ({
  $component,
  options,
}: {
  $component: ReturnType<CheerioAPI>
  options: Pick<ExportOptions, "markdown">
}) => {
  const quoteMarkdown = convertHtmlToMarkdown({
    html: $component.find("blockquote.se-quotation-container").html() ?? "",
    options,
  })

  if (!quoteMarkdown) {
    return null
  }

  return {
    type: "quote",
    text: quoteMarkdown,
  } satisfies AstBlock
}

const parseHeadingBlock = ({
  $component,
  options,
}: {
  $component: ReturnType<CheerioAPI>
  options: Pick<ExportOptions, "markdown">
}) => {
  const title = compactText(
    convertHtmlToMarkdown({
      html: $component.find(".se-module-text").html() ?? "",
      options,
    }),
  )

  if (!title) {
    return null
  }

  return {
    type: "heading",
    level: 2,
    text: title,
  } satisfies AstBlock
}

const parseFormulaBlock = ({
  $component,
  moduleData,
  warnings,
}: {
  $component: ReturnType<CheerioAPI>
  moduleData: Record<string, unknown>
  warnings: string[]
}) => {
  const data = (moduleData.data ?? {}) as {
    html?: string
    latex?: string
    text?: string
  }
  const candidates: string[] = []

  if (data.html) {
    const formulaDocument = load(data.html)

    candidates.push(
      ...formulaDocument(".mq-selectable")
        .toArray()
        .map((node) => compactText(formulaDocument(node).text()))
        .filter(Boolean),
    )
  }

  if (typeof data.latex === "string") {
    candidates.push(compactText(data.latex))
  }

  if (typeof data.text === "string") {
    candidates.push(compactText(data.text))
  }

  candidates.push(compactText($component.text()))

  const formula = candidates
    .map((candidate) => candidate.replace(/^\${1,2}/, "").replace(/\${1,2}$/, "").trim())
    .filter(Boolean)
    .sort((left, right) => right.length - left.length)[0]

  if (!formula) {
    warnings.push("수식 블록을 해석하지 못해 건너뛰었습니다.")
    return null
  }

  return {
    type: "formula",
    formula,
    display: true,
  } satisfies AstBlock
}

const parseCodeBlock = ($component: ReturnType<CheerioAPI>) => {
  const sourceNode = $component.find(".__se_code_view").first()
  const classNames = sourceNode.attr("class") ?? ""
  const languageMatch = classNames.match(/language-([\w-]+)/)
  const code = sourceNode.text().trimEnd()

  if (!code) {
    return null
  }

  return {
    type: "code",
    language: languageMatch?.[1] ?? null,
    code,
  } satisfies AstBlock
}

const parseLinkCardBlock = ($component: ReturnType<CheerioAPI>) => {
  const infoNode = $component.find(".se-oglink-info")
  const url = infoNode.attr("href") ?? $component.find(".se-oglink-thumbnail").attr("href") ?? ""

  if (!url) {
    return null
  }

  return {
    type: "linkCard",
    card: {
      title: compactText($component.find(".se-oglink-title").text()) || url,
      description: compactText($component.find(".se-oglink-summary").text()),
      url,
      imageUrl: (() => {
        const thumbnailSource = $component.find(".se-oglink-thumbnail-resource").attr("src")

        return thumbnailSource ? normalizeAssetUrl(thumbnailSource) : null
      })(),
    },
  } satisfies AstBlock
}

const parseOembedBlock = ({
  moduleData,
}: {
  moduleData: Record<string, unknown>
}) => {
  const data = (moduleData.data ?? {}) as {
    html?: string
    inputUrl?: string
    thumbnailUrl?: string
    description?: string
    title?: string
    providerUrl?: string
  }
  const iframeUrl =
    typeof data.html === "string" && data.html
      ? load(data.html)("iframe").attr("src") ?? null
      : null
  const url = data.inputUrl ?? iframeUrl ?? data.providerUrl ?? ""

  if (!url) {
    return null
  }

  return {
    type: "linkCard",
    card: {
      title: compactText(data.title ?? "") || url,
      description: compactText(data.description ?? ""),
      url,
      imageUrl:
        typeof data.thumbnailUrl === "string" ? normalizeAssetUrl(data.thumbnailUrl) : null,
    },
  } satisfies AstBlock
}

const parseVideoBlock = ({
  moduleData,
  sourceUrl,
}: {
  moduleData: Record<string, unknown>
  sourceUrl: string
}) => {
  const data = (moduleData.data ?? {}) as {
    thumbnail?: string
    vid?: string
    inkey?: string
    mediaMeta?: {
      title?: string
    }
    width?: string
    height?: string
  }

  return {
    type: "video",
    video: {
      title: data.mediaMeta?.title?.trim() || "Video",
      thumbnailUrl: data.thumbnail ? normalizeAssetUrl(data.thumbnail) : null,
      sourceUrl,
      vid: data.vid ?? null,
      inkey: data.inkey ?? null,
      width: data.width ? Number(data.width) : null,
      height: data.height ? Number(data.height) : null,
    },
  } satisfies AstBlock
}

const parseTableBlock = ({
  $,
  $component,
  warnings,
  options,
}: {
  $: CheerioAPI
  $component: ReturnType<CheerioAPI>
  warnings: string[]
  options: Pick<ExportOptions, "markdown">
}) => {
  const table = $component.find("table").first()

  if (table.length === 0) {
    warnings.push("표 블록을 표로 해석하지 못해 raw HTML fallback으로 남겼습니다.")

    return {
      type: "rawHtml",
      html: getComponentHtml({ $, $component }),
      reason: "table-fallback",
    } satisfies AstBlock
  }

  const parsedTable = parseHtmlTable({ $, table })

  return {
    type: "table",
    rows: parsedTable.rows,
    html: parsedTable.html,
    complex: parsedTable.complex,
  } satisfies AstBlock
}

const parseMaterialBlock = ($component: ReturnType<CheerioAPI>) => {
  const materialLink = $component.find("a.se-module-material").first()
  const linkData = parseJsonAttribute(materialLink.attr("data-linkdata"))
  const url = materialLink.attr("href") ?? (typeof linkData?.link === "string" ? linkData.link : "")

  if (!url) {
    return null
  }

  const description = materialLink
    .find(".se-material-detail")
    .children()
    .toArray()
    .reduce(
      (state, node) => {
        const $node = materialLink.find(node)

        if ($node.hasClass("se-material-detail-title")) {
          return {
            currentTitle: compactText($node.text()),
            entries: state.entries,
          }
        }

        if (!$node.hasClass("se-material-detail-description")) {
          return state
        }

        const detail = compactText($node.text())

        if (!detail) {
          return state
        }

        return {
          currentTitle: "",
          entries: [
            ...state.entries,
            state.currentTitle ? `${state.currentTitle}: ${detail}` : detail,
          ],
        }
      },
      {
        currentTitle: "",
        entries: [] as string[],
      },
    )
    .entries.join(" / ")

  const thumbnailSource =
    materialLink.find(".se-material-thumbnail-resource").attr("src") ??
    (typeof linkData?.thumbnail === "string" ? linkData.thumbnail : null)

  return {
    type: "linkCard",
    card: {
      title:
        compactText(materialLink.find(".se-material-title").text()) ||
        (typeof linkData?.title === "string" ? compactText(linkData.title) : "") ||
        url,
      description,
      url,
      imageUrl: thumbnailSource ? normalizeAssetUrl(thumbnailSource) : null,
    },
  } satisfies AstBlock
}

const parseUnsupportedComponent = ({
  $,
  $component,
  warnings,
  options,
}: {
  $: CheerioAPI
  $component: ReturnType<CheerioAPI>
  warnings: string[]
  options: Pick<ExportOptions, "markdown">
}) => {
  const className = $component.attr("class") ?? "unknown"
  const html = getComponentHtml({ $, $component })
  const markdown = convertHtmlToMarkdown({
    html,
    options,
  })

  if (markdown) {
    warnings.push(`지원하지 않는 SE4 블록을 텍스트로 변환했습니다: ${className}`)

    return {
      type: "paragraph",
      text: markdown,
    } satisfies AstBlock
  }

  warnings.push(`지원하지 않는 SE4 블록을 raw HTML로 보존했습니다: ${className}`)
  return {
    type: "rawHtml",
    html,
    reason: `unsupported:${className}`,
  } satisfies AstBlock
}

const parseImageBlock = ($component: ReturnType<CheerioAPI>) => {
  const image = parseImageLink($component.find("a.se-module-image-link").first())

  if (!image) {
    return null
  }

  return {
    type: "image",
    image,
  } satisfies AstBlock
}

const parseImageGroupBlock = ($component: ReturnType<CheerioAPI>) => {
  const images = $component
    .find("a.se-module-image-link")
    .toArray()
    .map((node) => parseImageLink($component.find(node)))
    .filter((image): image is ImageData => Boolean(image))

  if (images.length === 0) {
    return null
  }

  return {
    type: "imageGroup",
    images,
  } satisfies AstBlock
}

export const parseSe4Post = ({
  $,
  sourceUrl,
  tags,
  options,
}: {
  $: CheerioAPI
  sourceUrl: string
  tags: string[]
  options: Pick<ExportOptions, "markdown">
}) => {
  const warnings: string[] = []
  const blocks: AstBlock[] = []

  $("#viewTypeSelector .se-component")
    .toArray()
    .forEach((componentNode) => {
      const $component = $(componentNode)
      const moduleData = getComponentModule($component)
      const moduleType = typeof moduleData?.type === "string" ? moduleData.type : null
      const hasQuote = $component.find("blockquote.se-quotation-container").length > 0

      if ($component.hasClass("se-documentTitle")) {
        return
      }

      if (moduleType === "v2_formula" && moduleData) {
        const formulaBlock = parseFormulaBlock({ $component, moduleData, warnings })

        if (formulaBlock) {
          blocks.push(formulaBlock)
        }
        return
      }

      if (moduleType === "v2_code" || $component.hasClass("se-code")) {
        const codeBlock = parseCodeBlock($component)

        if (codeBlock) {
          blocks.push(codeBlock)
        }
        return
      }

      if (moduleType === "v2_oglink" || $component.hasClass("se-oglink")) {
        const linkCard = parseLinkCardBlock($component)

        if (linkCard) {
          blocks.push(linkCard)
        }
        return
      }

      if (moduleType === "v2_video" || $component.hasClass("se-video")) {
        blocks.push(parseVideoBlock({ moduleData: moduleData ?? {}, sourceUrl }))
        return
      }

      if (moduleType === "v2_oembed" || $component.hasClass("se-oembed")) {
        const oembedBlock = parseOembedBlock({
          moduleData: moduleData ?? {},
        })

        if (oembedBlock) {
          blocks.push(oembedBlock)
        } else {
          warnings.push("oEmbed 블록을 해석하지 못해 건너뛰었습니다.")
        }
        return
      }

      if (moduleType === "v2_table" || $component.hasClass("se-table")) {
        const tableBlock = parseTableBlock({
          $,
          $component,
          warnings,
          options,
        })

        if (tableBlock) {
          blocks.push(tableBlock)
        }
        return
      }

      if (moduleType === "v2_imageGroup") {
        const imageGroup = parseImageGroupBlock($component)

        if (imageGroup) {
          blocks.push(imageGroup)
        }
        return
      }

      if ($component.hasClass("se-image")) {
        const imageBlock = parseImageBlock($component)

        if (imageBlock) {
          blocks.push(imageBlock)
        }
        return
      }

      if ($component.hasClass("se-sectionTitle")) {
        const headingBlock = parseHeadingBlock({
          $component,
          options,
        })

        if (headingBlock) {
          blocks.push(headingBlock)
        }
        return
      }

      if ($component.hasClass("se-horizontalLine")) {
        blocks.push({ type: "divider" })
        return
      }

      if (hasQuote) {
        const quoteBlock = parseQuoteBlock({
          $component,
          options,
        })

        if (quoteBlock) {
          blocks.push(quoteBlock)
        }
        return
      }

      if (moduleType === "v2_text" || $component.hasClass("se-text")) {
        blocks.push(
          ...parseTextBlocks({
            $component,
            options,
          }),
        )
        return
      }

      if ($component.hasClass("se-material")) {
        const materialBlock = parseMaterialBlock($component)

        if (materialBlock) {
          blocks.push(materialBlock)
        } else {
          warnings.push("material 블록을 해석하지 못해 건너뛰었습니다.")
        }
        return
      }

      const fallbackBlock = parseUnsupportedComponent({
        $,
        $component,
        warnings,
        options,
      })

      if (fallbackBlock) {
        blocks.push(fallbackBlock)
      }
    })

  const videos = blocks
    .filter((block): block is Extract<AstBlock, { type: "video" }> => block.type === "video")
    .map((block) => block.video)

  return {
    editorVersion: 4,
    tags: unique(tags),
    blocks,
    warnings: unique(warnings),
    videos,
  } satisfies ParsedPost
}
