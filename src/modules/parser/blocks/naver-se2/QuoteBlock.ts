import { convertHtmlToMarkdown } from "../../../converter/HtmlFragmentConverter.js"
import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockResult } from "../ParserNode.js"
import type { ParserBlockContext } from "../ParserNode.js"

export class NaverSe2QuoteBlock extends LeafBlock {
  override readonly id = "se2-quote"

  override match({ node }: ParserBlockContext) {
    return node.type === "tag" && node.tagName.toLowerCase() === "blockquote"
  }

  override convert({ $node, options }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const markdown = convertHtmlToMarkdown({
      html: $node.html() ?? "",
      options,
      resolveLinkUrl: options.resolveLinkUrl,
    })

    return markdown
      ? {
          status: "handled",
          blocks: [{ type: "quote", text: markdown }],
        }
      : { status: "skip" }
  }
}
