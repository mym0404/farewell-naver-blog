import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe2DividerBlock extends LeafBlock {
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
