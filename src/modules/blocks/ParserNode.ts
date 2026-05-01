import type { Cheerio, CheerioAPI } from "cheerio"
import type { AnyNode } from "domhandler"

import type {
  ExportOptions,
  ParsedPostBodyNode,
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
}

export type ParserBlockConvertContext = ParserBlockContext & {
  outputSelection?: BlockOutputSelection
  appendBodyNodes: (nodes: ParsedPostBodyNode[]) => void
}

export type ParserBlockResult =
    | {
        status: "handled"
        blocks: AstBlock[]
      }
    | {
        status: "traverse"
        nodes?: AnyNode[]
      }
    | {
        status: "skip"
      }
