import type { ImageData } from "../../../../shared/types.js"
import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext, ParserBlockResult } from "../parser-node.js"
import { parseImageLink, se4ImageLinkSelector } from "./image-link.js"

export class NaverSe4ImageGroupBlock extends LeafBlock {
  override readonly id = "se4-image-group"

  override match({ moduleType }: ParserBlockContext) {
    return moduleType === "v2_imageGroup"
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
