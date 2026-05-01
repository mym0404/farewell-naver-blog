import { load } from "cheerio"

import type { ExportOptions } from "../../shared/Types.js"
import { unique } from "../../shared/Utils.js"
import { NaverBlog } from "../blog/NaverBlog.js"

export const parsePostHtml = ({
  html,
  sourceUrl,
  options,
}: {
  html: string
  sourceUrl: string
  options: Pick<ExportOptions, "blockOutputs"> & {
    resolveLinkUrl?: (url: string) => string
  }
}) => {
  const $ = load(html)
  const tags = unique(
    $(".post_tag a, .tag_area a, a[href*='PostTag']")
      .toArray()
      .map((node) => $(node).text().trim())
      .filter(Boolean),
  )

  return new NaverBlog().parsePost({
    $,
    html,
    sourceUrl,
    tags,
    options,
  })
}
