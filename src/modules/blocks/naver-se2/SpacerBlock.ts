import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"
import { isSpacerBlock } from "./ContainerBlock.js"

export class NaverSe2SpacerBlock extends LeafBlock {
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
