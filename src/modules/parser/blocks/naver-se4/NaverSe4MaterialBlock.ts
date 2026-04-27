import type { UnknownRecord } from "../../../../shared/Types.js"
import { compactText, normalizeAssetUrl } from "../../../../shared/Utils.js"
import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext } from "../parser-node.js"

const parseJsonAttribute = (value: string | undefined) => {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as UnknownRecord
  } catch {
    return null
  }
}

export class NaverSe4MaterialBlock extends LeafBlock {
  override readonly id = "se4-material"

  override match({ $node }: ParserBlockContext) {
    return $node.hasClass("se-material")
  }

  override convert({ $node }: Parameters<LeafBlock["convert"]>[0]) {
    const materialLink = $node.find("a.se-module-material").first()
    const linkData = parseJsonAttribute(materialLink.attr("data-linkdata"))
    const url = materialLink.attr("href") ?? (typeof linkData?.link === "string" ? linkData.link : "")

    if (!url) {
      return {
        status: "skip" as const,
        warnings: ["material 블록을 해석하지 못해 건너뛰었습니다."],
      }
    }

    const description = materialLink
      .find(".se-material-detail")
      .children()
      .toArray()
      .reduce(
        (state, node) => {
          const $detailNode = materialLink.find(node)

          if ($detailNode.hasClass("se-material-detail-title")) {
            return {
              currentTitle: compactText($detailNode.text()),
              entries: state.entries,
            }
          }

          if (!$detailNode.hasClass("se-material-detail-description")) {
            return state
          }

          const detail = compactText($detailNode.text())

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
      status: "handled" as const,
      blocks: [
        {
          type: "linkCard" as const,
          card: {
            title:
              compactText(materialLink.find(".se-material-title").text()) ||
              (typeof linkData?.title === "string" ? compactText(linkData.title) : "") ||
              url,
            description,
            url,
            imageUrl: thumbnailSource ? normalizeAssetUrl(thumbnailSource) : null,
          },
        },
      ],
    }
  }
}
