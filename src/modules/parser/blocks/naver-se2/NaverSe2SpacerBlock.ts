import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext, ParserBlockResult } from "../parser-node.js"
import { isSpacerBlock } from "./container-utils.js"

export class NaverSe2SpacerBlock extends LeafBlock {
  override readonly id = "se2-spacer"

  override match({ node, $node }: ParserBlockContext) {
    return (
      node.type === "tag" &&
      isSpacerBlock({
        element: $node,
        tagName: node.tagName.toLowerCase(),
      })
    )
  }

  override convert(): ParserBlockResult {
    return { status: "skip" }
  }
}
