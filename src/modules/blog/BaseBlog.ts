import type { CheerioAPI } from "cheerio"

import type { ExportOptions, ParsedPost } from "../../shared/Types.js"
import type { BaseEditor } from "../editor/BaseEditor.js"

export type BlogPostParseInput = {
  $: CheerioAPI
  html: string
  sourceUrl: string
  tags: string[]
  options: Pick<ExportOptions, "markdown"> & {
    resolveLinkUrl?: (url: string) => string
  }
}

export abstract class BaseBlog {
  abstract readonly editors: BaseEditor[]

  parsePost(input: BlogPostParseInput): ParsedPost {
    const editor = this.editors.find((candidate) => candidate.canParse(input.html))

    if (!editor) {
      throw new Error("지원하는 블로그 에디터를 찾지 못했습니다.")
    }

    return editor.parse(input)
  }
}
