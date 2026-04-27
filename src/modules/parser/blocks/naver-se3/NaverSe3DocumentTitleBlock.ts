import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext, ParserBlockResult } from "../parser-node.js"

export class NaverSe3DocumentTitleBlock extends LeafBlock {
  override readonly id = "se3-document-title"

  override match({ $node }: ParserBlockContext) {
    return $node.hasClass("se_documentTitle")
  }

  override convert(): ParserBlockResult {
    return { status: "skip" }
  }
}
