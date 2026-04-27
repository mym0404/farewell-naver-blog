import type { Cheerio, CheerioAPI } from "cheerio"
import type { AnyNode } from "domhandler"

import type {
  ExportOptions,
  ParsedPostBodyNode,
  StructuredAstBlock,
  UnknownRecord,
} from "../../../shared/types.js"

export type ParserBlockOptions = Pick<ExportOptions, "markdown"> &
  {
    resolveLinkUrl?: (url: string) => string
  }

export type ParserBlockContext<TNode extends AnyNode = AnyNode> = {
  $: CheerioAPI
  $node: Cheerio<TNode>
  node: TNode
  sourceUrl?: string
  tags: string[]
  options: ParserBlockOptions
  moduleData?: UnknownRecord | null
  moduleType?: string | null
  hasQuote?: boolean
}

export type ParserBlockConvertContext<TNode extends AnyNode = AnyNode> = ParserBlockContext<TNode> & {
  appendBodyNodes: (nodes: ParsedPostBodyNode[]) => void
  appendWarnings: (warnings: string[]) => void
}

export type ParserBlockResult<TNode extends AnyNode = AnyNode> =
  | {
      status: "handled"
      blocks: StructuredAstBlock[]
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
      nodes?: TNode[]
      warnings?: string[]
    }
  | {
      status: "skip"
      warnings?: string[]
    }

export abstract class BaseBlock<TNode extends AnyNode = AnyNode> {
  abstract readonly id: string
  abstract readonly kind: "container" | "leaf"

  abstract match(context: ParserBlockContext<TNode>): boolean

  abstract convert(context: ParserBlockConvertContext<TNode>): ParserBlockResult<TNode>
}

export abstract class ContainerBlock<TNode extends AnyNode = AnyNode> extends BaseBlock<TNode> {
  override readonly kind = "container"
}

export abstract class LeafBlock<TNode extends AnyNode = AnyNode> extends BaseBlock<TNode> {
  override readonly kind = "leaf"
}

export type ParserBlock<TNode extends AnyNode = AnyNode> = ContainerBlock<TNode> | LeafBlock<TNode>
