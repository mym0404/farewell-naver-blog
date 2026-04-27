import { ContainerBlock } from "../parser-node.js"
import type { ParserBlockContext, ParserBlockResult } from "../parser-node.js"
import { shouldTraverseNestedBlocks } from "./container-utils.js"

export class NaverSe2ContainerBlock extends ContainerBlock {
  override readonly id = "se2-container"

  override match({ node, $node }: ParserBlockContext) {
    return (
      node.type === "tag" &&
      shouldTraverseNestedBlocks({
        element: $node,
        tagName: node.tagName.toLowerCase(),
      })
    )
  }

  override convert({ $node }: Parameters<ContainerBlock["convert"]>[0]): ParserBlockResult {
    return {
      status: "traverse",
      nodes: $node.contents().toArray(),
    }
  }
}
