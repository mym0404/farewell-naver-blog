import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"
import { parseBookWidgetBlocks } from "./BookWidget.js"

export class NaverSe2BookWidgetBlock extends LeafBlock {
  override readonly id = "se2-book-widget"

  override match({ node, $node }: ParserBlockContext) {
    return node.type === "tag" && $node.is('[s_type="db"][s_subtype="book"]')
  }

  override convert({ $node, options }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const blocks = parseBookWidgetBlocks({
      element: $node,
      resolveLinkUrl: options.resolveLinkUrl,
    })

    return blocks ? { status: "handled", blocks } : { status: "skip" }
  }
}
