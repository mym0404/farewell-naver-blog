import type {
  AstBlock,
  UnsupportedBlockCandidateId,
  UnsupportedBlockInstance,
} from "./types.js"

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")

const escapeMarkdownLinkLabel = (value: string) =>
  value
    .replaceAll("\\", "\\\\")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]")

const buildGifPosterImageBlock = ({
  posterUrl,
  sourceUrl,
  linked,
}: {
  posterUrl: string | null
  sourceUrl: string
  linked: boolean
}): AstBlock[] => {
  if (!posterUrl) {
    return [
      {
        type: "video",
        video: {
          title: "GIF video",
          thumbnailUrl: null,
          sourceUrl,
          vid: null,
          inkey: null,
          width: null,
          height: null,
        },
        outputSelection: {
          variant: "source-link",
        },
      },
    ]
  }

  return [
    {
      type: "image",
      image: {
        sourceUrl: posterUrl,
        originalSourceUrl: linked ? sourceUrl : posterUrl,
        alt: "",
        caption: null,
        mediaKind: "image",
      },
      outputSelection: {
        variant: linked ? "linked-image" : "markdown-image",
      },
    },
  ]
}

const buildHorizontalLineHtml = (styleToken: "default" | "line5") =>
  `<hr data-naver-block="se3-horizontal-line" data-style="${styleToken}">`

const buildOgLinkHtml = ({
  url,
  title,
  description,
  publisher,
  imageUrl,
}: {
  url: string
  title: string
  description: string
  publisher: string
  imageUrl: string | null
}) => {
  const sections = [
    `<a data-naver-block="se3-oglink" data-size="og_bSize" href="${escapeHtml(url)}">`,
  ]

  if (imageUrl) {
    sections.push(`  <img src="${escapeHtml(imageUrl)}" alt="">`)
  }

  sections.push(`  <strong>${escapeHtml(title)}</strong>`)

  if (description) {
    sections.push(`  <span>${escapeHtml(description)}</span>`)
  }

  if (publisher) {
    sections.push(`  <span>${escapeHtml(publisher)}</span>`)
  }

  sections.push("</a>")

  return sections.join("\n")
}

export const buildUnsupportedBlockCaseBlocks = ({
  unsupportedBlock,
  candidateId,
}: {
  unsupportedBlock: UnsupportedBlockInstance
  candidateId: UnsupportedBlockCandidateId
}): AstBlock[] => {
  switch (unsupportedBlock.caseId) {
    case "se2-inline-gif-video": {
      const data = unsupportedBlock.data

      if (candidateId === "source-link-only") {
        return [
          {
            type: "video",
            video: {
              title: "GIF video",
              thumbnailUrl: data.posterUrl,
              sourceUrl: data.sourceUrl,
              vid: null,
              inkey: null,
              width: null,
              height: null,
            },
            outputSelection: {
              variant: "source-link",
            },
          },
        ]
      }

      return buildGifPosterImageBlock({
        posterUrl: data.posterUrl,
        sourceUrl: data.sourceUrl,
        linked: candidateId === "linked-poster-image",
      })
    }

    case "se3-horizontal-line-default":
    case "se3-horizontal-line-line5": {
      const data = unsupportedBlock.data

      if (candidateId === "asterisk-hr" || candidateId === "markdown-hr") {
        return [
          {
            type: "divider",
            outputSelection: {
              variant: candidateId === "asterisk-hr" ? "asterisk-rule" : "dash-rule",
            },
          },
        ]
      }

      return [
        {
          type: "htmlFragment",
          html: buildHorizontalLineHtml(data.styleToken),
        },
      ]
    }

    case "se3-oglink-og_bSize": {
      const data = unsupportedBlock.data

      if (candidateId === "title-link-only") {
        return [
          {
            type: "linkCard",
            card: {
              title: data.title,
              description: data.description,
              url: data.url,
              imageUrl: data.imageUrl,
            },
            outputSelection: {
              variant: "title-link",
            },
          },
        ]
      }

      if (candidateId === "markdown-image-summary") {
        const blocks: AstBlock[] = []

        if (data.imageUrl) {
          blocks.push({
            type: "image",
            image: {
              sourceUrl: data.imageUrl,
              originalSourceUrl: data.url,
              alt: "",
              caption: null,
              mediaKind: "image",
            },
            outputSelection: {
              variant: "linked-image",
            },
          })
        }

        blocks.push({
          type: "paragraph",
          text: `[${escapeMarkdownLinkLabel(data.title)}](${data.url})`,
        })

        if (data.description) {
          blocks.push({
            type: "paragraph",
            text: data.description,
          })
        }

        if (data.publisher) {
          blocks.push({
            type: "paragraph",
            text: data.publisher,
          })
        }

        return blocks
      }

      return [
        {
          type: "htmlFragment",
          html: buildOgLinkHtml(data),
        },
      ]
    }
  }
}
