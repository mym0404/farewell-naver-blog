import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe3DocumentTitleBlock extends LeafBlock {
  override readonly id = "se3-document-title"

  override match({ $node }: ParserBlockContext) {
    return $node.hasClass("se_documentTitle")
  }

  override convert(): ParserBlockResult {
    return { status: "skip" }
  }
}
