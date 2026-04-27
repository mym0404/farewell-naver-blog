import type { CheerioAPI } from "cheerio"

import type { AstBlock, ExportOptions, ParsedPost } from "../../../shared/Types.js"
import { unique } from "../../../shared/Utils.js"
import type { ParserBlock } from "../blocks/parser-node.js"
import { NaverSe2BookWidgetBlock } from "../blocks/naver-se2/NaverSe2BookWidgetBlock.js"
import { NaverSe2CodeBlock } from "../blocks/naver-se2/NaverSe2CodeBlock.js"
import { NaverSe2ContainerBlock } from "../blocks/naver-se2/NaverSe2ContainerBlock.js"
import { NaverSe2DividerBlock } from "../blocks/naver-se2/NaverSe2DividerBlock.js"
import { NaverSe2FallbackBlock } from "../blocks/naver-se2/NaverSe2FallbackBlock.js"
import { NaverSe2HeadingBlock } from "../blocks/naver-se2/NaverSe2HeadingBlock.js"
import { NaverSe2ImageBlock } from "../blocks/naver-se2/NaverSe2ImageBlock.js"
import { NaverSe2InlineGifVideoFallbackBlock } from "../blocks/naver-se2/NaverSe2InlineGifVideoFallbackBlock.js"
import { NaverSe2LineBreakBlock } from "../blocks/naver-se2/NaverSe2LineBreakBlock.js"
import { NaverSe2QuoteBlock } from "../blocks/naver-se2/NaverSe2QuoteBlock.js"
import { NaverSe2SpacerBlock } from "../blocks/naver-se2/NaverSe2SpacerBlock.js"
import { NaverSe2TableBlock } from "../blocks/naver-se2/NaverSe2TableBlock.js"
import { NaverSe2TextElementBlock } from "../blocks/naver-se2/NaverSe2TextElementBlock.js"
import { NaverSe2TextNodeBlock } from "../blocks/naver-se2/NaverSe2TextNodeBlock.js"
import { BaseEditor } from "./base-editor.js"

export type ParseSe2PostInput = {
  $: CheerioAPI
  tags: string[]
  options: Pick<ExportOptions, "markdown"> & {
    resolveLinkUrl?: (url: string) => string
  }
}

export class NaverBlogSE2Editor extends BaseEditor<ParseSe2PostInput> {
  protected override readonly supportedBlocks: readonly ParserBlock[] = [
    new NaverSe2TextNodeBlock(),
    new NaverSe2BookWidgetBlock(),
    new NaverSe2ContainerBlock(),
    new NaverSe2TableBlock(),
    new NaverSe2DividerBlock(),
    new NaverSe2LineBreakBlock(),
    new NaverSe2QuoteBlock(),
    new NaverSe2HeadingBlock(),
    new NaverSe2CodeBlock(),
    new NaverSe2InlineGifVideoFallbackBlock(),
    new NaverSe2ImageBlock(),
    new NaverSe2SpacerBlock(),
    new NaverSe2TextElementBlock(),
    new NaverSe2FallbackBlock(),
  ]

  parse({ $, tags, options }: ParseSe2PostInput): ParsedPost {
    const container = $("#viewTypeSelector").first()
    const { blocks, body, warnings } = this.runBlocks({
      $,
      nodes: container.contents().toArray(),
      tags,
      options,
    })

    const videos = blocks
      .filter((block): block is Extract<AstBlock, { type: "video" }> => block.type === "video")
      .map((block) => block.video)

    return {
      editorVersion: 2,
      tags: unique(tags),
      body,
      blocks,
      warnings: unique(warnings),
      videos,
    } satisfies ParsedPost
  }
}
