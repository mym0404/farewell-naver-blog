import { compactText, normalizeAssetUrl } from "../../../../shared/utils.js"
import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext, ParserBlockResult } from "../parser-node.js"

export class NaverSe4LinkCardBlock extends LeafBlock {
  override readonly id = "se4-link-card"

  override match({ $node, moduleType }: ParserBlockContext) {
    return moduleType === "v2_oglink" || $node.hasClass("se-oglink")
  }

  override convert({ $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const infoNode = $node.find(".se-oglink-info")
    const url = infoNode.attr("href") ?? $node.find(".se-oglink-thumbnail").attr("href") ?? ""

    if (!url) {
      return { status: "skip" }
    }

    return {
      status: "handled",
      blocks: [
        {
          type: "linkCard",
          card: {
            title: compactText($node.find(".se-oglink-title").text()) || url,
            description: compactText($node.find(".se-oglink-summary").text()),
            url,
            imageUrl: (() => {
              const thumbnailSource = $node.find(".se-oglink-thumbnail-resource").attr("src")

              return thumbnailSource ? normalizeAssetUrl(thumbnailSource) : null
            })(),
          },
        },
      ],
    }
  }
}
