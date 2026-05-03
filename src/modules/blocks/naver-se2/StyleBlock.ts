import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe2StyleBlock extends LeafBlock {
  override readonly id = "style"
  override readonly label = "HTML 스타일"

  override match({ node }: ParserBlockContext) {
    return node.type === "style"
  }

  override convert(): ParserBlockResult {
    return { status: "skip" }
  }
}
