import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"
import { isSpacerBlock } from "./ContainerUtils.js"

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
