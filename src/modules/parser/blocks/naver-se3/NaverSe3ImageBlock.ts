import type { CheerioAPI } from "cheerio"

import type { ImageData } from "../../../../shared/types.js"
import { compactText, normalizeAssetUrl } from "../../../../shared/utils.js"
import { LeafBlock } from "../parser-node.js"
import type { ParserBlockResult } from "../parser-node.js"
import type { ParserBlockContext } from "../parser-node.js"

const getStandaloneImages = ({
  $,
  $component,
}: {
  $: CheerioAPI
  $component: ReturnType<CheerioAPI>
}) => {
  const images = $component
    .find("img")
    .toArray()
    .map((node): ImageData | null => {
      const $image = $(node)
      const sourceUrl = $image.attr("data-lazy-src") ?? $image.attr("src") ?? ""

      if (!sourceUrl.trim()) {
        return null
      }

      return {
        sourceUrl: normalizeAssetUrl(sourceUrl),
        originalSourceUrl: null,
        alt: $image.attr("alt") ?? "",
        caption: null,
        mediaKind: "image",
      } satisfies ImageData
    })
    .filter((image): image is ImageData => image !== null)

  const textWithoutImages = compactText(
    $component
      .clone()
      .find("img")
      .remove()
      .end()
      .text(),
  )

  return textWithoutImages ? [] : images
}

export class NaverSe3ImageBlock extends LeafBlock {
  override readonly id = "se3-image"

  override match({ $, $node }: ParserBlockContext) {
    return getStandaloneImages({ $, $component: $node }).length > 0
  }

  override convert({ $, $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const standaloneImages = getStandaloneImages({ $, $component: $node })

    if (standaloneImages.length === 1) {
      return {
        status: "handled" as const,
        blocks: [{ type: "image" as const, image: standaloneImages[0]! }],
      }
    }

    return {
      status: "handled" as const,
      blocks: [{ type: "imageGroup" as const, images: standaloneImages }],
    }
  }
}
