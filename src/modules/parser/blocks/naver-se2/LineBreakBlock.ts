import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe2LineBreakBlock extends LeafBlock {
  override readonly id = "se2-line-break"

  override match({ node }: ParserBlockContext) {
    return node.type === "tag" && node.tagName.toLowerCase() === "br"
  }

  override convert(): ParserBlockResult {
    return { status: "skip" }
  }
}
