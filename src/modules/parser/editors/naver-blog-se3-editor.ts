import type { CheerioAPI } from "cheerio"

import type { ExportOptions, ParsedPost } from "../../../shared/types.js"
import { unique } from "../../../shared/utils.js"
import type { ParserBlock } from "../blocks/parser-node.js"
import { NaverSe3CodeBlock } from "../blocks/naver-se3/NaverSe3CodeBlock.js"
import { NaverSe3DocumentTitleBlock } from "../blocks/naver-se3/NaverSe3DocumentTitleBlock.js"
import { NaverSe3FallbackBlock } from "../blocks/naver-se3/NaverSe3FallbackBlock.js"
import { NaverSe3ImageBlock } from "../blocks/naver-se3/NaverSe3ImageBlock.js"
import { NaverSe3QuoteBlock } from "../blocks/naver-se3/NaverSe3QuoteBlock.js"
import { NaverSe3RepresentativeUnsupportedBlock } from "../blocks/naver-se3/NaverSe3RepresentativeUnsupportedBlock.js"
import { NaverSe3TableBlock } from "../blocks/naver-se3/NaverSe3TableBlock.js"
import { NaverSe3TextBlock } from "../blocks/naver-se3/NaverSe3TextBlock.js"
import { BaseEditor } from "./base-editor.js"

export type ParseSe3PostInput = {
  $: CheerioAPI
  tags: string[]
  options: Pick<ExportOptions, "markdown"> & {
    resolveLinkUrl?: (url: string) => string
  }
}

export class NaverBlogSE3Editor extends BaseEditor<ParseSe3PostInput> {
  protected override readonly supportedBlocks: readonly ParserBlock[] = [
    new NaverSe3DocumentTitleBlock(),
    new NaverSe3TableBlock(),
    new NaverSe3QuoteBlock(),
    new NaverSe3CodeBlock(),
    new NaverSe3ImageBlock(),
    new NaverSe3RepresentativeUnsupportedBlock(),
    new NaverSe3TextBlock(),
    new NaverSe3FallbackBlock(),
  ]

  parse({ $, tags, options }: ParseSe3PostInput): ParsedPost {
    const container = $("#viewTypeSelector .se_component_wrap.sect_dsc").first()
    const { blocks, body, warnings } = this.runBlocks({
      $,
      nodes: container.children(".se_component").toArray(),
      tags,
      options,
    })

    return {
      editorVersion: 3,
      tags: unique(tags),
      body,
      blocks,
      warnings: unique(warnings),
      videos: [],
    } satisfies ParsedPost
  }
}
