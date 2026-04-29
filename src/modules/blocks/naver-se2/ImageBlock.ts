import type { CheerioAPI } from "cheerio"

import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockResult } from "../ParserNode.js"
import type { ParserBlockContext } from "../ParserNode.js"
import type { ImageData } from "../../../shared/Types.js"
import { compactText, normalizeAssetUrl } from "../../../shared/Utils.js"

const standaloneImageSelector = "img, [thumburl]"

const getStandaloneImages = ({
  $,
  element,
}: {
  $: CheerioAPI
  element: ReturnType<CheerioAPI>
}) => {
  const images = $(element)
    .find(standaloneImageSelector)
    .toArray()
    .map((imageNode): ImageData | null => {
      const $image = $(imageNode)
      const sourceUrl = normalizeAssetUrl($image.attr("src") ?? $image.attr("thumburl") ?? "")

      if (!sourceUrl) {
        return null
      }

      return {
        sourceUrl,
        originalSourceUrl: null,
        alt: $image.attr("alt") ?? "",
        caption: null,
        mediaKind: "image",
      } satisfies ImageData
    })
    .filter((image): image is ImageData => image !== null)

  const textWithoutImages = compactText(
    $(element)
      .clone()
      .find(standaloneImageSelector)
      .remove()
      .end()
      .text(),
  )

  return textWithoutImages ? [] : images
}

export class NaverSe2ImageBlock extends LeafBlock {
  override match({ node, $, $node }: ParserBlockContext) {
    return node.type === "tag" && getStandaloneImages({ $, element: $node }).length > 0
  }

  override convert({ $, $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const standaloneImages = getStandaloneImages({ $, element: $node })

    if (standaloneImages.length === 1) {
      return {
        status: "handled",
        blocks: [{ type: "image", image: standaloneImages[0]! }],
      }
    }

    return {
      status: "handled",
      blocks: [{ type: "imageGroup", images: standaloneImages }],
    }
  }
}
