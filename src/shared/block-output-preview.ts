import type {
  AstBlock,
  BlockOutputSelection,
  ExportOptions,
} from "./types.js"
import {
  composeRawHtmlPreview,
  composeSnippetWithReferences,
  createLinkFormatter,
  getDividerMarker,
  getHeadingLevelOffset,
  renderCodeBlock,
  renderFormula,
  renderGfmTable,
  renderImageBlockMarkdown,
  renderLinkCardBlock,
  renderParagraph,
  renderQuote,
} from "./block-markdown.js"

const stripHtmlForPreview = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

const toPreviewAssetPath = (sourceUrl: string) => {
  const pathname = (() => {
    try {
      return new URL(sourceUrl).pathname
    } catch {
      return sourceUrl
    }
  })()
  const filename = pathname.split("/").filter(Boolean).at(-1) || "image.png"

  return `../../public/${filename}`
}

const getPreviewImageReference = ({
  sourceUrl,
  imageHandlingMode,
}: {
  sourceUrl: string
  imageHandlingMode: ExportOptions["assets"]["imageHandlingMode"]
}) => (imageHandlingMode === "remote" ? sourceUrl : toPreviewAssetPath(sourceUrl))

const renderRawHtmlPreview = ({
  block,
  selection,
  linkFormatter,
}: {
  block: Extract<AstBlock, { type: "rawHtml" }>
  selection: BlockOutputSelection
  linkFormatter: ReturnType<typeof createLinkFormatter>
}) => {
  const extractedText = stripHtmlForPreview(block.html)
  const message = `raw HTML 블록을 생략했습니다: ${block.reason}`

  if (selection.variant === "omit") {
    return composeRawHtmlPreview({
      body: "",
      diagnostics: [
        {
          level: extractedText ? "warning" : "error",
          message,
          detail: extractedText || undefined,
        },
      ],
      linkFormatter,
    })
  }

  if (!extractedText) {
    return composeRawHtmlPreview({
      body: "",
      diagnostics: [
        {
          level: "error",
          message,
        },
      ],
      linkFormatter,
    })
  }

  return composeRawHtmlPreview({
    body: extractedText,
    diagnostics: [
      {
        level: "warning",
        message: `raw HTML 블록을 Markdown으로 변환했습니다: ${block.reason}`,
        detail: extractedText,
      },
    ],
    linkFormatter,
  })
}

export const renderBlockOutputPreview = ({
  block,
  selection,
  linkStyle,
  includeImageCaptions,
  imageHandlingMode,
}: {
  block: AstBlock
  selection: BlockOutputSelection
  linkStyle: ExportOptions["markdown"]["linkStyle"]
  includeImageCaptions: boolean
  imageHandlingMode: ExportOptions["assets"]["imageHandlingMode"]
}) => {
  const linkFormatter = createLinkFormatter({
    style: linkStyle,
  })

  if (block.type === "paragraph") {
    return renderParagraph(block.text)
  }

  if (block.type === "heading") {
    const adjustedLevel = Math.min(
      Math.max(block.level + getHeadingLevelOffset(selection), 1),
      6,
    )

    return `${"#".repeat(adjustedLevel)} ${block.text}`
  }

  if (block.type === "quote") {
    return renderQuote(block.text)
  }

  if (block.type === "divider") {
    return getDividerMarker(selection)
  }

  if (block.type === "code") {
    return renderCodeBlock({
      language: block.language,
      code: block.code,
      variant: selection.variant,
    })
  }

  if (block.type === "formula") {
    return renderFormula({
      formula: block.formula,
      display: block.display,
      selection,
    })
  }

  if (block.type === "image") {
    return composeSnippetWithReferences({
      body: renderImageBlockMarkdown({
        image: block.image,
        assetPath: getPreviewImageReference({
          sourceUrl: block.image.sourceUrl,
          imageHandlingMode,
        }),
        selection,
        formatLink: linkFormatter.formatLink,
        includeImageCaptions,
      }),
      linkFormatter,
    })
  }

  if (block.type === "imageGroup") {
    return composeSnippetWithReferences({
      body: block.images
        .map((image) =>
          renderImageBlockMarkdown({
            image,
            assetPath: getPreviewImageReference({
              sourceUrl: image.sourceUrl,
              imageHandlingMode,
            }),
            selection,
            formatLink: linkFormatter.formatLink,
            includeImageCaptions,
          }),
        )
        .join("\n\n"),
      linkFormatter,
    })
  }

  if (block.type === "video") {
    return composeSnippetWithReferences({
      body: linkFormatter.formatLink({
        label: block.video.title || block.video.sourceUrl,
        url: block.video.sourceUrl,
      }),
      linkFormatter,
    })
  }

  if (block.type === "linkCard") {
    return composeSnippetWithReferences({
      body: renderLinkCardBlock({
        block,
        formatLink: linkFormatter.formatLink,
      }),
      linkFormatter,
    })
  }

  if (block.type === "table") {
    return selection.variant === "html-only" ? block.html : renderGfmTable(block)
  }

  return renderRawHtmlPreview({
    block,
    selection,
    linkFormatter,
  })
}
