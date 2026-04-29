import { convertHtmlToMarkdown } from "../../converter/HtmlFragmentConverter.js"
import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext } from "../ParserNode.js"

export class NaverSe4QuoteBlock extends LeafBlock {
  override match({ hasQuote }: ParserBlockContext) {
    return Boolean(hasQuote)
  }

  override convert({ $node, options }: Parameters<LeafBlock["convert"]>[0]) {
    const quoteMarkdown = convertHtmlToMarkdown({
      html: $node.find("blockquote.se-quotation-container").html() ?? "",
      options,
      resolveLinkUrl: options.resolveLinkUrl,
    })

    return quoteMarkdown
      ? {
          status: "handled" as const,
          blocks: [{ type: "quote" as const, text: quoteMarkdown }],
        }
      : { status: "skip" as const }
  }
}
