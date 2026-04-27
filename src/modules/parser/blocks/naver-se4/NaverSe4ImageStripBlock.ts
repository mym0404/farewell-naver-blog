import type { ImageData } from "../../../../shared/Types.js"
import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext, ParserBlockResult } from "../parser-node.js"
import { parseImageLink, se4ImageLinkSelector } from "./image-link.js"

export class NaverSe4ImageStripBlock extends LeafBlock {
  override readonly id = "se4-image-strip"

  override match({ $node }: ParserBlockContext) {
    return $node.hasClass("se-imageStrip")
  }

  override convert({ $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const images = $node
      .find(se4ImageLinkSelector)
      .toArray()
      .map((node): ImageData | null => parseImageLink($node.find(node)))
      .filter((image): image is ImageData => image !== null)

    return images.length > 0
      ? {
          status: "handled",
          blocks: [{ type: "imageGroup", images }],
        }
      : { status: "skip" }
  }
}
