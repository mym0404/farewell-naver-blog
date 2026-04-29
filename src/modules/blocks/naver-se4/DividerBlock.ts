import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe4DividerBlock extends LeafBlock {
  override match({ $node }: ParserBlockContext) {
    return $node.hasClass("se-horizontalLine")
  }

  override convert(): ParserBlockResult {
    return {
      status: "handled",
      blocks: [{ type: "divider" }],
    }
  }
}
