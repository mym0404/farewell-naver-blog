import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe4DocumentTitleBlock extends LeafBlock {
  override readonly id = "se4-document-title"

  override match({ $node }: ParserBlockContext) {
    return $node.hasClass("se-documentTitle")
  }

  override convert(): ParserBlockResult {
    return { status: "skip" }
  }
}
