import { convertHtmlToMarkdown } from "../../converter/HtmlFragmentConverter.js"
import { compactText } from "../../../shared/Utils.js"
import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext } from "../ParserNode.js"

export class NaverSe4HeadingBlock extends LeafBlock {
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
