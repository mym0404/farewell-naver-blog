import { sanitizeHtmlFragment } from "../../converter/HtmlFragmentConverter.js"
import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe3RepresentativeUnsupportedBlock extends LeafBlock {
  override match({ $node }: ParserBlockContext) {
    return (
      ($node.hasClass("se_horizontalLine") && $node.find(".se_hr > hr").length > 0) ||
      ($node.hasClass("se_oglink") && $node.hasClass("og_bSize"))
    )
  }

  override convert({ $, $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const className = $node.attr("class") ?? "unknown"

    return {
      status: "fallback",
      html: sanitizeHtmlFragment($.html($node) ?? ""),
      reason: `se3:${className}`,
      warnings: [`SE3 대표 미지원 블록을 원본 HTML로 보존했습니다: ${className}`],
    }
  }
}
