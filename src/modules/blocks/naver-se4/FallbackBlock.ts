import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockResult } from "../ParserNode.js"
import { getComponentHtml } from "./ComponentHtml.js"

export class NaverSe4FallbackBlock extends LeafBlock {
  override match() {
    return true
  }

  override convert({ $, $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const className = $node.attr("class") ?? "unknown"

    return {
      status: "fallback",
      html: getComponentHtml({ $, $node }),
      reason: `unsupported:${className}`,
      warnings: [`지원하지 않는 SE4 블록을 원본 HTML로 보존했습니다: ${className}`],
    }
  }
}
