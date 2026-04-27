import { normalizeAssetUrl } from "../../../../shared/Utils.js"
import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext, ParserBlockResult } from "../parser-node.js"
import { parseJsonAttribute } from "./json-attribute.js"

export class NaverSe4StickerBlock extends LeafBlock {
  override readonly id = "se4-sticker"

  override match({ $node }: ParserBlockContext) {
    return $node.hasClass("se-sticker")
  }

  override convert({ $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const stickerLink = $node.find("a.__se_sticker_link").first()
    const linkData = parseJsonAttribute(stickerLink.attr("data-linkdata"))
    const previewSourceUrl = $node.find("img.se-sticker-image").attr("src")?.trim() ?? null
    const originalSourceUrl = typeof linkData?.src === "string" ? linkData.src.trim() : null
    const sourceUrl = [previewSourceUrl, originalSourceUrl]
      .find((candidate): candidate is string => Boolean(candidate?.trim()))
      ?.trim()

    if (!sourceUrl) {
      return { status: "skip" }
    }

    return {
      status: "handled",
      blocks: [
        {
          type: "image",
          image: {
            sourceUrl: normalizeAssetUrl(sourceUrl),
            originalSourceUrl: originalSourceUrl ? normalizeAssetUrl(originalSourceUrl) : null,
            alt: "",
            caption: null,
            mediaKind: "sticker",
          },
        },
      ],
    }
  }
}
