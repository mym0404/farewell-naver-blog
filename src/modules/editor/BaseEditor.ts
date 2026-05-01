import type { CheerioAPI } from "cheerio"
import type { AnyNode } from "domhandler"

import type {
  AstBlock,
  BlockOutputSelection,
  EditorBlockOutputDefinition,
  ExportOptions,
  ParsedPost,
  UnknownRecord,
} from "@shared/Types.js"
import { resolveBlockOutputSelection } from "@shared/BlockRegistry.js"
import {
  createBodyNodesFromStructuredBlocks,
} from "../blocks/BodyNodeUtils.js"
import type {
  ParserBlockContext,
  ParserBlockConvertContext,
  ParserBlockOptions,
} from "../blocks/ParserNode.js"
import { LeafBlock, type BaseBlock } from "../blocks/BaseBlock.js"

const describeParserNode = ({ $node, node, moduleType }: ParserBlockContext) => {
  const tagName = node.type === "tag" ? node.tagName.toLowerCase() : node.type
  const className = $node.attr("class")
  const parts = [tagName]

  if (className) {
    parts.push(`class="${className}"`)
  }

  if (moduleType) {
    parts.push(`moduleType="${moduleType}"`)
  }

  return parts.join(" ")
}

export type BaseEditorParseInput = {
  $: CheerioAPI
  sourceUrl?: string
  tags: string[]
  options: Pick<ExportOptions, "blockOutputs"> &
    {
      resolveLinkUrl?: (url: string) => string
    }
}

export abstract class BaseEditor {
  abstract readonly type: string
  abstract readonly label: string

  protected readonly supportedBlocks: readonly BaseBlock[] = []

  abstract canParse(html: string): boolean

  abstract parse(input: BaseEditorParseInput): ParsedPost

  getBlockOutputDefinitions(): EditorBlockOutputDefinition[] {
    const definitions: EditorBlockOutputDefinition[] = []
    const seenKeys = new Set<string>()

    this.supportedBlocks.forEach((block) => {
      const outputOptions = block.outputOptions

      if (!block.id || !outputOptions || outputOptions.length < 2) {
        return
      }

      const key = this.createBlockOutputSelectionKey(block.id)

      if (seenKeys.has(key)) {
        return
      }

      seenKeys.add(key)
      definitions.push({
        key,
        editorType: this.type,
        editorLabel: this.label,
        blockId: block.id,
        blockLabel: block.label,
        options: [...outputOptions],
      })
    })

    return definitions
  }

  private createBlockOutputSelectionKey(blockId: string) {
    return `${this.type}:${blockId}`
  }

  protected runBlocks({
    $,
    nodes,
    tags,
    options,
    sourceUrl,
    moduleContext,
  }: {
    $: CheerioAPI
    nodes: AnyNode[]
    tags: string[]
    options: ParserBlockOptions
    sourceUrl?: string
    moduleContext?: (node: AnyNode) => {
      moduleData?: UnknownRecord | null
      moduleType?: string | null
      hasQuote?: boolean
    }
  }) {
    const applyOutputSelection = ({
      parsedBlock,
      parserBlock,
    }: {
      parsedBlock: AstBlock
      parserBlock: BaseBlock
    }) => {
      const outputOptions = parserBlock.outputOptions

      if (
        !parserBlock.id ||
        !outputOptions ||
        outputOptions.length < 2 ||
        !outputOptions.some((option) => option.preview.type === parsedBlock.type)
      ) {
        return parsedBlock
      }

      const selectionKey = this.createBlockOutputSelectionKey(parserBlock.id)

      if (
        (parserBlock.id === "paragraph" || parserBlock.id === "linkCard") &&
        !options.blockOutputs.defaults?.[selectionKey]
      ) {
        return parsedBlock
      }

      return {
        ...parsedBlock,
        outputSelectionKey: selectionKey,
        outputSelection: resolveBlockOutputSelection({
          blockType: parsedBlock.type,
          outputOptions: outputOptions.filter((option) => option.preview.type === parsedBlock.type),
          blockOutputs: options.blockOutputs,
          selectionKey,
        }) as BlockOutputSelection,
      } as AstBlock & {
        outputSelectionKey: string
        outputSelection: BlockOutputSelection
      }
    }

    const createBlockContext = (node: AnyNode): ParserBlockContext => ({
      $,
      $node: $(node),
      node,
      sourceUrl,
      tags,
      options,
      matchLeafNode,
      ...moduleContext?.(node),
    })

    const matchLeafNode = (node: AnyNode) => {
      const context = createBlockContext(node)

      return this.supportedBlocks.some(
        (supportedBlock) => supportedBlock instanceof LeafBlock && supportedBlock.match(context),
      )
    }

    const matchNode = (node: AnyNode): AstBlock[] => {
      const context = createBlockContext(node)
      const block = this.supportedBlocks.find((supportedBlock) => supportedBlock.match(context))

      if (!block) {
        throw new Error(`파싱 가능한 ${this.type} block이 없습니다: ${describeParserNode(context)}`)
      }

      const outputOptions = block.outputOptions
      const firstOutputOption = outputOptions?.[0]
      const outputSelection =
        block.id && outputOptions && outputOptions.length >= 2 && firstOutputOption
          ? resolveBlockOutputSelection({
              blockType: firstOutputOption.preview.type,
              outputOptions,
              blockOutputs: options.blockOutputs,
              selectionKey: this.createBlockOutputSelectionKey(block.id),
            })
          : undefined
      const convertContext = {
        ...context,
        outputSelection,
        matchNode,
      } satisfies ParserBlockConvertContext

      const result = block.convert(convertContext)

      if (result.status === "skip") {
        return []
      }

      return result.blocks.map((parsedBlock) =>
        applyOutputSelection({
          parsedBlock,
          parserBlock: block,
        }),
      )
    }

    const blocks = nodes.flatMap(matchNode)

    return {
      blocks,
      body: createBodyNodesFromStructuredBlocks(blocks),
    }
  }
}
