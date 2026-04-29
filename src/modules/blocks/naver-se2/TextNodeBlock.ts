import { compactText } from "../../../shared/Utils.js"
import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe2TextNodeBlock extends LeafBlock {
  override match({ node }: ParserBlockContext) {
    return node.type === "text"
  }

  override convert({ node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const text = node.type === "text" ? compactText(node.data ?? "") : ""

    return text
      ? {
          status: "handled",
          blocks: [{ type: "paragraph", text }],
        }
      : { status: "skip" }
  }
}
