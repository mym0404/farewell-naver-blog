import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext, ParserBlockResult } from "../parser-node.js"

export class NaverSe2LineBreakBlock extends LeafBlock {
  override readonly id = "se2-line-break"

  override match({ node }: ParserBlockContext) {
    return node.type === "tag" && node.tagName.toLowerCase() === "br"
  }

  override convert(): ParserBlockResult {
    return { status: "skip" }
  }
}
