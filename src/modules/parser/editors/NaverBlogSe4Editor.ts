import type { CheerioAPI } from "cheerio"
import type { AnyNode } from "domhandler"

import type { AstBlock, ExportOptions, ParsedPost, UnknownRecord } from "../../../shared/Types.js"
import { unique } from "../../../shared/Utils.js"
import type { ParserBlock } from "../blocks/parser-node.js"
import { NaverSe4CodeBlock } from "../blocks/naver-se4/NaverSe4CodeBlock.js"
import { NaverSe4DividerBlock } from "../blocks/naver-se4/NaverSe4DividerBlock.js"
import { NaverSe4DocumentTitleBlock } from "../blocks/naver-se4/NaverSe4DocumentTitleBlock.js"
import { NaverSe4FallbackBlock } from "../blocks/naver-se4/NaverSe4FallbackBlock.js"
import { NaverSe4FormulaBlock } from "../blocks/naver-se4/NaverSe4FormulaBlock.js"
import { NaverSe4HeadingBlock } from "../blocks/naver-se4/NaverSe4HeadingBlock.js"
import { NaverSe4ImageBlock } from "../blocks/naver-se4/NaverSe4ImageBlock.js"
import { NaverSe4ImageGroupBlock } from "../blocks/naver-se4/NaverSe4ImageGroupBlock.js"
import { NaverSe4ImageStripBlock } from "../blocks/naver-se4/NaverSe4ImageStripBlock.js"
import { NaverSe4LinkCardBlock } from "../blocks/naver-se4/NaverSe4LinkCardBlock.js"
import { NaverSe4MapBlock } from "../blocks/naver-se4/NaverSe4MapBlock.js"
import { NaverSe4MaterialBlock } from "../blocks/naver-se4/NaverSe4MaterialBlock.js"
import { NaverSe4OembedBlock } from "../blocks/naver-se4/NaverSe4OembedBlock.js"
import { NaverSe4QuoteBlock } from "../blocks/naver-se4/NaverSe4QuoteBlock.js"
import { NaverSe4StickerBlock } from "../blocks/naver-se4/NaverSe4StickerBlock.js"
import { NaverSe4TableBlock } from "../blocks/naver-se4/NaverSe4TableBlock.js"
import { NaverSe4TextBlock } from "../blocks/naver-se4/NaverSe4TextBlock.js"
import { NaverSe4VideoBlock } from "../blocks/naver-se4/NaverSe4VideoBlock.js"
import { BaseEditor } from "./base-editor.js"

const parseJsonAttribute = (value: string | undefined) => {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as UnknownRecord
  } catch {
    return null
  }
}

const getComponentModule = ($component: ReturnType<CheerioAPI>) => {
  const moduleScript = $component.find("script.__se_module_data").first()

  return (
    parseJsonAttribute(moduleScript.attr("data-module-v2")) ??
    parseJsonAttribute(moduleScript.attr("data-module"))
  )
}

export type ParseSe4PostInput = {
  $: CheerioAPI
  sourceUrl: string
  tags: string[]
  options: Pick<ExportOptions, "markdown"> & {
    resolveLinkUrl?: (url: string) => string
  }
}

export class NaverBlogSE4Editor extends BaseEditor<ParseSe4PostInput> {
  protected override readonly supportedBlocks: readonly ParserBlock[] = [
    new NaverSe4DocumentTitleBlock(),
    new NaverSe4FormulaBlock(),
    new NaverSe4CodeBlock(),
    new NaverSe4LinkCardBlock(),
    new NaverSe4VideoBlock(),
    new NaverSe4OembedBlock(),
    new NaverSe4MapBlock(),
    new NaverSe4TableBlock(),
    new NaverSe4ImageStripBlock(),
    new NaverSe4ImageGroupBlock(),
    new NaverSe4StickerBlock(),
    new NaverSe4ImageBlock(),
    new NaverSe4HeadingBlock(),
    new NaverSe4DividerBlock(),
    new NaverSe4QuoteBlock(),
    new NaverSe4TextBlock(),
    new NaverSe4MaterialBlock(),
    new NaverSe4FallbackBlock(),
  ]

  parse({ $, sourceUrl, tags, options }: ParseSe4PostInput): ParsedPost {
    const { blocks, body, warnings } = this.runBlocks({
      $,
      nodes: $("#viewTypeSelector .se-component").toArray(),
      sourceUrl,
      tags,
      options,
      moduleContext: (node: AnyNode) => {
        const $component = $(node)
        const moduleData = getComponentModule($component)

        return {
          moduleData,
          moduleType: typeof moduleData?.type === "string" ? moduleData.type : null,
          hasQuote: $component.find("blockquote.se-quotation-container").length > 0,
        }
      },
    })

    const videos = blocks
      .filter((block): block is Extract<AstBlock, { type: "video" }> => block.type === "video")
      .map((block) => block.video)

    return {
      editorVersion: 4,
      tags: unique(tags),
      body,
      blocks,
      warnings: unique(warnings),
      videos,
    } satisfies ParsedPost
  }
}
