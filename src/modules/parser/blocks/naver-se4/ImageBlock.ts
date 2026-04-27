import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"
import { parseImageLink, se4ImageLinkSelector } from "./ImageLink.js"

export class NaverSe4ImageBlock extends LeafBlock {
  override readonly id = "se4-image"

  override match({ $node }: ParserBlockContext) {
    return $node.hasClass("se-image")
  }

  override convert({ $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const image = parseImageLink($node.find(se4ImageLinkSelector).first())

    return image
      ? {
          status: "handled",
          blocks: [{ type: "image", image }],
        }
      : { status: "skip" }
  }
}
