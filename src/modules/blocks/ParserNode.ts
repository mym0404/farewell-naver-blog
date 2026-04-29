import type { Cheerio, CheerioAPI } from "cheerio"
import type { AnyNode } from "domhandler"

import type {
  ExportOptions,
  ParsedPostBodyNode,
  AstBlock,
  UnknownRecord,
} from "../../shared/Types.js"

export type ParserBlockOptions = Pick<ExportOptions, "markdown" | "blockOutputs"> &
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
  appendBodyNodes: (nodes: ParsedPostBodyNode[]) => void
  appendWarnings: (warnings: string[]) => void
}

export type ParserBlockResult =
  | {
      status: "handled"
      blocks: AstBlock[]
      warnings?: string[]
    }
  | {
      status: "fallback"
      html: string
      reason: string
      warnings?: string[]
    }
  | {
      status: "traverse"
      nodes?: AnyNode[]
      warnings?: string[]
    }
  | {
      status: "skip"
      warnings?: string[]
    }
