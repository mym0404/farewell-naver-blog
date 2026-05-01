import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"
import { hasInlineGifVideo } from "./InlineGifVideoUtils.js"

export class NaverSe2InlineGifVideoBlock extends LeafBlock {
  override match({ node, $node }: ParserBlockContext) {
    return node.type === "tag" && hasInlineGifVideo({ $node })
  }

  override convert(): ParserBlockResult {
    throw new Error("SE2 inline GIF video block parsing failed.")
  }
}
