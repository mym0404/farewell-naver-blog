import { convertHtmlToMarkdown } from "../../converter/HtmlFragmentConverter.js"
import {
  getMarkdownLinkStyleFromSelection,
  paragraphOutputOptions,
} from "../../../shared/BlockOutputOptions.js"
import { compactText } from "../../../shared/Utils.js"
import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe2TextElementBlock extends LeafBlock {
  override readonly id = "paragraph"
  override readonly label = "문단"
  override readonly outputOptions = paragraphOutputOptions

  override match({ node, $node }: ParserBlockContext) {
    if (node.type !== "tag") {
      return false
    }

    if (compactText($node.text()) === "") {
      return false
    }

    return !["table", "hr", "br", "blockquote", "pre"].includes(node.tagName.toLowerCase())
  }

  override convert({ $, $node, node, options, outputSelection }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    if (node.type !== "tag") {
      throw new Error("SE2 text element block received a non-tag node.")
    }

    const html = $.html($node) ?? ""
    const markdown = convertHtmlToMarkdown({
      html,
      options: {
        linkStyle: getMarkdownLinkStyleFromSelection(outputSelection),
      },
      resolveLinkUrl: options.resolveLinkUrl,
    })

    if (markdown) {
      return {
        status: "handled",
        blocks: [{ type: "paragraph", text: markdown }],
      }
    }

    const text = compactText($node.text())

    if (!text) {
      throw new Error(`SE2 text element block parsing failed: <${node.tagName.toLowerCase()}>`)
    }

    throw new Error(`SE2 text element block markdown conversion failed: <${node.tagName.toLowerCase()}>`)
  }
}
