import { LeafBlock } from "../parser-node.js"
import type { ParserBlockResult } from "../parser-node.js"

export class NaverSe2CodeBlock extends LeafBlock {
  override readonly id = "se2-code"

  override match({ node }: Parameters<LeafBlock["match"]>[0]) {
    return node.type === "tag" && node.tagName.toLowerCase() === "pre"
  }

  override convert({ $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const code = $node.text().trimEnd()

    return code
      ? {
          status: "handled",
          blocks: [{ type: "code", language: null, code }],
        }
      : { status: "skip" }
  }
}
