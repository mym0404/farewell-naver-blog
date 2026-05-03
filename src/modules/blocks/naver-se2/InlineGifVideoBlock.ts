import type { CheerioAPI } from "cheerio"

import { compactText, normalizeAssetUrl } from "../../../shared/Utils.js"
import type { ImageData } from "../../../shared/Types.js"
import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

const getInlineGifVideoImages = ({ $, $node }: { $: CheerioAPI; $node: ReturnType<CheerioAPI> }): ImageData[] | null => {
  if (!$node.is("p, div, span")) {
    return null
  }

  const videos = $node.find("video.fx._postImage._gifmp4[data-gif-url]")

  if (videos.length === 0) {
    return null
  }

  const cloneWithoutVideo = $node.clone()

  cloneWithoutVideo.find("video.fx._postImage._gifmp4").remove()

  if (cloneWithoutVideo.find("img, iframe, video, table").length > 0) {
    return null
  }

  const textWithoutVideo = compactText(
    cloneWithoutVideo.text(),
  )

  if (textWithoutVideo) {
    return null
  }

  const images = []

  for (const videoNode of videos.toArray()) {
    const video = $(videoNode)
    /* v8 ignore next */
    const sourceUrl = normalizeAssetUrl(video.attr("data-gif-url") ?? video.attr("src") ?? "")
    const originalSourceUrl = normalizeAssetUrl(video.attr("src") ?? "")

    if (!sourceUrl) {
      return null
    }

    images.push({
      sourceUrl,
      /* v8 ignore next */
      originalSourceUrl: originalSourceUrl && originalSourceUrl !== sourceUrl ? originalSourceUrl : null,
      alt: video.attr("alt") ?? "",
      caption: null,
      mediaKind: "image",
    } satisfies ImageData)
  }

  return images
}

export class NaverSe2InlineGifVideoBlock extends LeafBlock {
  override readonly id = "inlineGifVideo"
  override readonly label = "인라인 GIF 비디오"

  override match({ $, node, $node }: ParserBlockContext) {
    return node.type === "tag" && getInlineGifVideoImages({ $, $node }) !== null
  }

  override convert({ $, $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const images = getInlineGifVideoImages({ $, $node })

    /* v8 ignore next 3 */
    if (!images) {
      return { status: "skip" }
    }

    return {
      status: "handled",
      blocks: images.map((image) => ({ type: "image", image })),
    }
  }
}
