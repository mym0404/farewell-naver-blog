import { convertHtmlToMarkdown } from "../../../converter/html-fragment-converter.js"
import { LeafBlock } from "../parser-node.js"
import type { ParserBlockResult } from "../parser-node.js"
import type { ParserBlockContext } from "../parser-node.js"

export class NaverSe3QuoteBlock extends LeafBlock {
  override readonly id = "se3-quote"

  override match({ $node }: ParserBlockContext) {
    return $node.find("blockquote").first().length > 0
  }

  override convert({ $node, options }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const markdown = convertHtmlToMarkdown({
      html: $node.find("blockquote").first().html() ?? "",
      options,
      resolveLinkUrl: options.resolveLinkUrl,
    })

    return markdown
      ? { status: "handled" as const, blocks: [{ type: "quote" as const, text: markdown }] }
      : { status: "skip" as const }
  }
}
