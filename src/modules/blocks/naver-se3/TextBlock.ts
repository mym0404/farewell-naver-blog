import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"
import { parseTextBlocks } from "./TextUtils.js"

export class NaverSe3TextBlock extends LeafBlock {
  override match({ $node }: ParserBlockContext) {
    return $node.find(".se_textarea").length > 0
  }

  override convert({ $, $node, options }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const blocks = parseTextBlocks({ $, $component: $node, options })

    return blocks.length > 0 ? { status: "handled", blocks } : { status: "skip" }
  }
}
