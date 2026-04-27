import { convertHtmlToMarkdown } from "../../../converter/HtmlFragmentConverter.js"
import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockResult } from "../ParserNode.js"
import type { ParserBlockContext } from "../ParserNode.js"

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
