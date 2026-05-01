import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"
import { parseBookWidgetBlocks } from "./BookWidget.js"

export class NaverSe2BookWidgetBlock extends LeafBlock {
  override match({ node, $node }: ParserBlockContext) {
    return node.type === "tag" && $node.is('[s_type="db"][s_subtype="book"]')
  }

  override convert({ $node, options }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const blocks = parseBookWidgetBlocks({
      element: $node,
      resolveLinkUrl: options.resolveLinkUrl,
    })

    if (!blocks) {
      throw new Error("SE2 book widget block parsing failed.")
    }

    return { status: "handled", blocks }
  }
}
