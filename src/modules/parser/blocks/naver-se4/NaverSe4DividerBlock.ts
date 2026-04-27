import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext, ParserBlockResult } from "../parser-node.js"

export class NaverSe4DividerBlock extends LeafBlock {
  override readonly id = "se4-divider"

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
