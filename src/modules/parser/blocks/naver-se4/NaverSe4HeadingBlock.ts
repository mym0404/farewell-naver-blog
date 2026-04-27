import { convertHtmlToMarkdown } from "../../../converter/html-fragment-converter.js"
import { compactText } from "../../../../shared/utils.js"
import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext } from "../parser-node.js"

export class NaverSe4HeadingBlock extends LeafBlock {
  override readonly id = "se4-heading"

  override match({ $node }: ParserBlockContext) {
    return $node.hasClass("se-sectionTitle")
  }

  override convert({ $node, options }: Parameters<LeafBlock["convert"]>[0]) {
    const title = compactText(
      convertHtmlToMarkdown({
        html: $node.find(".se-module-text").html() ?? "",
        options,
        resolveLinkUrl: options.resolveLinkUrl,
      }),
    )

    return title
      ? {
          status: "handled" as const,
          blocks: [{ type: "heading" as const, level: 2 as const, text: title }],
        }
      : { status: "skip" as const }
  }
}
