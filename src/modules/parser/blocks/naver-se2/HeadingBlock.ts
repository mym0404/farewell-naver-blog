import { convertHtmlToMarkdown } from "../../../converter/HtmlFragmentConverter.js"
import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockResult } from "../ParserNode.js"
import type { ParserBlockContext } from "../ParserNode.js"
import { compactText } from "../../../../shared/Utils.js"

export class NaverSe2HeadingBlock extends LeafBlock {
  override readonly id = "se2-heading"

  override match({ node }: ParserBlockContext) {
    return node.type === "tag" && /^h[1-6]$/.test(node.tagName.toLowerCase())
  }

  override convert({ $node, node, options }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    if (node.type !== "tag") {
      return { status: "skip" }
    }

    const level = Number(node.tagName[1])
    const text = compactText(
      convertHtmlToMarkdown({
        html: $node.html() ?? "",
        options,
        resolveLinkUrl: options.resolveLinkUrl,
      }),
    )

    return text
      ? {
          status: "handled",
          blocks: [{ type: "heading", level, text }],
        }
      : { status: "skip" }
  }
}
