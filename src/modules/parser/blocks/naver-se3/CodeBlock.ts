import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockResult } from "../ParserNode.js"
import type { ParserBlockContext } from "../ParserNode.js"

export class NaverSe3CodeBlock extends LeafBlock {
  override readonly id = "se3-code"

  override match({ $node }: ParserBlockContext) {
    return $node.find("pre").first().length > 0
  }

  override convert({ $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const code = $node.find("pre").first().text().trimEnd()

    return code
      ? {
          status: "handled" as const,
          blocks: [{ type: "code" as const, language: null, code }],
        }
      : { status: "skip" as const }
  }
}
