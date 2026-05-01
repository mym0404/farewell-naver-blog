import type { CheerioAPI } from "cheerio"

import { compactText, normalizeAssetUrl } from "../../../shared/Utils.js"
import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

const hasInlineGifVideo = ({ $node }: { $node: ReturnType<CheerioAPI> }) => {
  if (!$node.is("p")) {
    return false
  }

  const video = $node.children("video.fx._postImage._gifmp4[data-gif-url]").first()

  if (video.length === 0) {
    return false
  }

  const textWithoutVideo = compactText(
    $node
      .clone()
      .children("video")
      .remove()
      .end()
      .text(),
  )

  return !textWithoutVideo && Boolean(normalizeAssetUrl(video.attr("src") ?? ""))
}

export class NaverSe2InlineGifVideoBlock extends LeafBlock {
  override match({ node, $node }: ParserBlockContext) {
    return node.type === "tag" && hasInlineGifVideo({ $node })
  }

  override convert(): ParserBlockResult {
    throw new Error("SE2 inline GIF video block parsing failed.")
  }
}
