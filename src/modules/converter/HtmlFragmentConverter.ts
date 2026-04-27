import TurndownService, { type Node as TurndownNode } from "turndown"
import { gfm } from "turndown-plugin-gfm"
import { JSDOM } from "jsdom"

import type { ExportOptions, MarkdownLinkStyle } from "../../shared/Types.js"

const createDocument = (html: string) => new JSDOM(`<body>${html}</body>`).window.document

export type HtmlFragmentConversionOptions = {
  linkStyle: MarkdownLinkStyle
  dividerMarker?: "---" | "***"
}

type HtmlFragmentConversionInput =
  | HtmlFragmentConversionOptions
  | Pick<ExportOptions, "markdown">

const createService = ({
  options,
}: {
  options: HtmlFragmentConversionOptions
}) => {
  const service = new TurndownService({
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    headingStyle: "atx",
    hr: options.dividerMarker ?? "---",
    linkStyle: options.linkStyle,
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
  resolveLinkUrl,
}: {
  html: string
  options: HtmlFragmentConversionInput
  resolveLinkUrl?: (url: string) => string
}) => {
  const normalizedOptions =
    "markdown" in options
      ? {
          linkStyle: options.markdown.linkStyle,
        }
      : options
  const sanitized = sanitizeHtmlFragment(html)
  const document = createDocument(sanitized)

  if (resolveLinkUrl) {
    document.querySelectorAll("a[href]").forEach((anchor) => {
      const href = anchor.getAttribute("href")

      if (!href?.trim()) {
        return
      }

      anchor.setAttribute("href", resolveLinkUrl(href))
    })
  }

  const turndownService = createService({
    options: normalizedOptions,
  })
  const markdown = turndownService.turndown(document.body)

  return markdown.trim().replace(/\n{3,}/g, "\n\n")
}
