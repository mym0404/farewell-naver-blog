import type { Cheerio, CheerioAPI } from "cheerio"
import type { AnyNode } from "domhandler"

import type {
  ExportOptions,
  AstBlock,
  BlockOutputSelection,
  UnknownRecord,
} from "../../shared/Types.js"

export type ParserBlockOptions = Pick<ExportOptions, "blockOutputs"> &
  {
    resolveLinkUrl?: (url: string) => string
  }

export type ParserBlockContext = {
  $: CheerioAPI
  $node: Cheerio<AnyNode>
  node: AnyNode
  sourceUrl?: string
  tags: string[]
  options: ParserBlockOptions
  moduleData?: UnknownRecord | null
  moduleType?: string | null
  hasQuote?: boolean
  matchLeafNode: (node: AnyNode) => boolean
}

export type ParserBlockConvertContext = ParserBlockContext & {
  outputSelection?: BlockOutputSelection
  matchNode: (node: AnyNode) => AstBlock[]
}

export type ParserBlockResult =
    | {
        status: "handled"
        blocks: AstBlock[]
      }
    | {
        status: "skip"
      }
