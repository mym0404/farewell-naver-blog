import { convertHtmlToMarkdown } from "../../converter/HtmlFragmentConverter.js"
import { compactText } from "../../../shared/Utils.js"
import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

export class NaverSe2TextElementBlock extends LeafBlock {
  override match({ node, $node }: ParserBlockContext) {
    if (node.type !== "tag") {
      return false
    }

    if (compactText($node.text()) === "") {
      return false
    }

    return !["table", "hr", "br", "blockquote", "pre"].includes(node.tagName.toLowerCase())
  }

  override convert({ $, $node, node, options }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    if (node.type !== "tag") {
      return { status: "skip" }
    }

    const html = $.html($node) ?? ""
    const markdown = convertHtmlToMarkdown({
      html,
      options,
      resolveLinkUrl: options.resolveLinkUrl,
    })

    if (markdown) {
      return {
        status: "handled",
        blocks: [{ type: "paragraph", text: markdown }],
      }
    }

    const text = compactText($node.text())

    return text
      ? {
          status: "handled",
          blocks: [{ type: "paragraph", text }],
          warnings: [`SE2 블록을 구조화하지 못해 텍스트로 축약했습니다: <${node.tagName.toLowerCase()}>`],
        }
      : { status: "skip" }
  }
}
