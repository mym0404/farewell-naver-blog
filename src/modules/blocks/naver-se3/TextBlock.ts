import type { CheerioAPI } from "cheerio"

import { convertHtmlToMarkdown } from "../../converter/HtmlFragmentConverter.js"
import { compactMarkdownText } from "../../../shared/Utils.js"
import { LeafBlock } from "../BaseBlock.js"
import type { OutputOption } from "../../../shared/Types.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"

const parseTextBlocks = ({
  $,
  $component,
  options,
}: {
  $: CheerioAPI
  $component: ReturnType<CheerioAPI>
  options: ParserBlockContext["options"]
}) =>
  $component
    .find(".se_textarea")
    .toArray()
    .map((node) =>
      convertHtmlToMarkdown({
        html: $(node).html() ?? "",
        options,
        resolveLinkUrl: options.resolveLinkUrl,
      }),
    )
    .map((text) => compactMarkdownText(text))
    .filter(Boolean)
    .map((text) => ({
      type: "paragraph" as const,
      text,
    }))

export class NaverSe3TextBlock extends LeafBlock {
  override readonly outputId = "paragraph"
  override readonly outputOptions = [
    {
      id: "markdown-paragraph",
      label: "Markdown 문단",
      description: "정규화된 문단 텍스트를 그대로 출력합니다.",
      preview: {
        type: "paragraph",
        text: "첫 줄입니다.\n\n둘째 문단입니다.",
      },
      isDefault: true,
    },
  ] satisfies OutputOption<"paragraph">[]

  override match({ $node }: ParserBlockContext) {
    return $node.find(".se_textarea").length > 0
  }

  override convert({ $, $node, options }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const blocks = parseTextBlocks({ $, $component: $node, options })

    if (blocks.length === 0) {
      throw new Error("SE3 text block parsing failed.")
    }

    return { status: "handled", blocks }
  }
}
