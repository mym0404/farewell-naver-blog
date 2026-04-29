import { sanitizeHtmlFragment } from "../../converter/HtmlFragmentConverter.js"
import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"
import { hasInlineGifVideo } from "./InlineGifVideoUtils.js"

export class NaverSe2InlineGifVideoFallbackBlock extends LeafBlock {
  override match({ node, $node }: ParserBlockContext) {
    return node.type === "tag" && hasInlineGifVideo({ $node })
  }

  override convert({ $, $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const html = sanitizeHtmlFragment($.html($node) ?? "")

    return html
      ? {
          status: "fallback",
          html,
          reason: "se2:inline-gif-video",
          warnings: ["SE2 GIF video 블록을 구조화하지 못해 원본 HTML로 보존했습니다."],
        }
      : { status: "skip" }
  }
}
