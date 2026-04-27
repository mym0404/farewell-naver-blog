import type { CheerioAPI } from "cheerio"

import { convertHtmlToMarkdown } from "../../../converter/html-fragment-converter.js"
import { compactMarkdownText } from "../../../../shared/Utils.js"
import type { ParserBlockContext } from "../parser-node.js"

export const parseTextBlocks = ({
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
