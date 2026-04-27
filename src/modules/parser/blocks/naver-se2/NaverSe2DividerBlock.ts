import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext, ParserBlockResult } from "../parser-node.js"

export class NaverSe2DividerBlock extends LeafBlock {
  override readonly id = "se2-divider"

  override match({ node }: ParserBlockContext) {
    return node.type === "tag" && node.tagName.toLowerCase() === "hr"
  }

  override convert(): ParserBlockResult {
    return {
      status: "handled",
      blocks: [{ type: "divider" }],
    }
  }
}
