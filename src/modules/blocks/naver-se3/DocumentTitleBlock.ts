import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe3DocumentTitleBlock extends LeafBlock {
  override match({ $node }: ParserBlockContext) {
    return $node.hasClass("se_documentTitle")
  }

  override convert(): ParserBlockResult {
    return { status: "skip" }
  }
}
