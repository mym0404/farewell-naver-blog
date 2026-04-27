import { sanitizeHtmlFragment } from "../../../converter/HtmlFragmentConverter.js"
import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockResult } from "../ParserNode.js"

export class NaverSe3FallbackBlock extends LeafBlock {
  override readonly id = "se3-fallback"

  override match() {
    return true
  }

  override convert({ $, $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const className = $node.attr("class") ?? "unknown"

    return {
      status: "fallback",
      html: sanitizeHtmlFragment($.html($node) ?? ""),
      reason: `se3:${className}`,
      warnings: [`SE3 블록을 구조화하지 못해 원본 HTML로 보존했습니다: ${className}`],
    }
  }
}
