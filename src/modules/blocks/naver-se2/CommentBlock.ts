import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe2CommentBlock extends LeafBlock {
  override readonly id = "comment"
  override readonly label = "HTML 주석"

  override match({ node }: ParserBlockContext) {
    return node.type === "comment"
  }

  override convert(): ParserBlockResult {
    return { status: "skip" }
  }
}
