import type { CheerioAPI } from "cheerio"

import { compactText, normalizeAssetUrl } from "../../../shared/Utils.js"
import type { ImageData } from "../../../shared/Types.js"
import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

const getInlineGifVideoImage = ({ $node }: { $node: ReturnType<CheerioAPI> }): ImageData | null => {
  if (!$node.is("p")) {
    return null
  }

  const video = $node.children("video.fx._postImage._gifmp4[data-gif-url]").first()

  if (video.length === 0) {
    return null
  }

  const textWithoutVideo = compactText(
    $node
      .clone()
      .children("video")
      .remove()
      .end()
      .text(),
  )

  if (textWithoutVideo) {
    return null
  }

  const sourceUrl = normalizeAssetUrl(video.attr("data-gif-url") ?? video.attr("src") ?? "")
  const originalSourceUrl = normalizeAssetUrl(video.attr("src") ?? "")

  if (!sourceUrl) {
    return null
  }

  return {
    sourceUrl,
    originalSourceUrl: originalSourceUrl && originalSourceUrl !== sourceUrl ? originalSourceUrl : null,
    alt: video.attr("alt") ?? "",
    caption: null,
    mediaKind: "image",
  }
}

export class NaverSe2InlineGifVideoBlock extends LeafBlock {
  override readonly id = "inlineGifVideo"
  override readonly label = "인라인 GIF 비디오"

  override match({ node, $node }: ParserBlockContext) {
    return node.type === "tag" && getInlineGifVideoImage({ $node }) !== null
  }

  override convert({ $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const image = getInlineGifVideoImage({ $node })

    if (!image) {
      return { status: "skip" }
    }

    return {
      status: "handled",
      blocks: [{ type: "image", image }],
    }
  }
}
