import TurndownService, { type Node as TurndownNode } from "turndown"
import { gfm } from "turndown-plugin-gfm"
import { JSDOM } from "jsdom"

import type { ExportOptions } from "../../shared/types.js"

const createDocument = (html: string) => new JSDOM(`<body>${html}</body>`).window.document

const createService = ({
  markdown,
}: {
  markdown: ExportOptions["markdown"]
}) => {
  const service = new TurndownService({
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    headingStyle: "atx",
    hr: markdown.dividerStyle === "asterisk" ? "***" : "---",
    linkStyle: markdown.linkStyle,
  })

  service.use(gfm)
  service.addRule("hardBreak", {
    filter: "br",
    replacement: () => "  \n",
  })
  service.addRule("emptyParagraph", {
    filter: (node: TurndownNode) => node.nodeName === "P" && !node.textContent?.trim(),
    replacement: () => "",
  })

  return service
}

export const sanitizeHtmlFragment = (html: string) => {
  const document = createDocument(html)

  document.querySelectorAll("script, style, noscript").forEach((node) => {
    node.remove()
  })

  document.querySelectorAll("*").forEach((element) => {
    element.getAttributeNames().forEach((attributeName) => {
      if (attributeName.startsWith("on")) {
        element.removeAttribute(attributeName)
      }
    })
  })

  return document.body.innerHTML.trim()
}

export const convertHtmlToMarkdown = ({
  html,
  options,
}: {
  html: string
  options: Pick<ExportOptions, "markdown">
}) => {
  const sanitized = sanitizeHtmlFragment(html)
  const document = createDocument(sanitized)
  const turndownService = createService({
    markdown: options.markdown,
  })
  const markdown = turndownService.turndown(document.body)

  return markdown.trim().replace(/\n{3,}/g, "\n\n")
}
