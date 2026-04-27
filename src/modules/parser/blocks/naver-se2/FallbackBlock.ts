import { sanitizeHtmlFragment } from "../../../converter/HtmlFragmentConverter.js"
import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe2FallbackBlock extends LeafBlock {
  override readonly id = "se2-fallback"

  override match({ node }: ParserBlockContext) {
    return node.type === "tag"
  }

  override convert({ $, $node, node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    if (node.type !== "tag") {
      return { status: "skip" }
    }

    const html = sanitizeHtmlFragment($.html($node) ?? "")

    return html
      ? {
          status: "fallback",
          html,
          reason: `se2:${node.tagName.toLowerCase()}`,
          warnings: [`SE2 블록을 구조화하지 못해 원본 HTML로 보존했습니다: <${node.tagName.toLowerCase()}>`],
        }
      : { status: "skip" }
  }
}
