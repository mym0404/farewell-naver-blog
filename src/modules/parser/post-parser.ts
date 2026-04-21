import { load } from "cheerio"

import type { EditorVersion, ExportOptions } from "../../shared/types.js"
import { unique } from "../../shared/utils.js"
import { parseSe2Post } from "./se2-parser.js"
import { parseSe3Post } from "./se3-parser.js"
import { parseSe4Post } from "./se4-parser.js"

const editorVersionPattern = /smartEditorVersion["']?\s*:\s*["']?(\d+)["']?/i

const extractTags = (html: string) => {
  const $ = load(html)

  const tags = $(".post_tag a, .tag_area a, a[href*='PostTag']")
    .toArray()
    .map((node) => $(node).text().trim())
    .filter(Boolean)

  return unique(tags)
}

export const detectEditorVersionFromHtml = (html: string): EditorVersion => {
  const versionMatch = html.replaceAll("&#034;", "\"").match(editorVersionPattern)

  if (versionMatch?.[1] === "2") {
    return 2
  }

  if (versionMatch?.[1] === "3") {
    return 3
  }

  if (versionMatch?.[1] === "4") {
    return 4
  }

  if (html.includes('class="se-component')) {
    return 4
  }

  if (html.includes('class="se_component')) {
    return 3
  }

  return 2
}

export const parsePostHtml = ({
  html,
  sourceUrl,
  options,
}: {
  html: string
  sourceUrl: string
  options: Pick<ExportOptions, "markdown"> & {
    resolveLinkUrl?: (url: string) => string
  }
}) => {
  const editorVersion = detectEditorVersionFromHtml(html)
  const tags = extractTags(html)
  const $ = load(html)

  if (editorVersion === 4) {
    return parseSe4Post({
      $,
      sourceUrl,
      tags,
      options,
    })
  }

  if (editorVersion === 3) {
    return parseSe3Post({
      $,
      tags,
      options,
    })
  }

  return parseSe2Post({
    $,
    tags,
    options,
  })
}
