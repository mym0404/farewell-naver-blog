import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe2LineBreakBlock extends LeafBlock {
  override match({ node }: ParserBlockContext) {
    return node.type === "tag" && node.tagName.toLowerCase() === "br"
  }

  override convert(): ParserBlockResult {
    return { status: "skip" }
  }
}
