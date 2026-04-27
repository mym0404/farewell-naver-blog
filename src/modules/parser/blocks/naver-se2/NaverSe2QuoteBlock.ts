import { convertHtmlToMarkdown } from "../../../converter/html-fragment-converter.js"
import { LeafBlock } from "../parser-node.js"
import type { ParserBlockResult } from "../parser-node.js"
import type { ParserBlockContext } from "../parser-node.js"

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
