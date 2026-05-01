import type { CheerioAPI } from "cheerio"
import type { AnyNode } from "domhandler"

import type {
  AstBlock,
  BlockOutputSelection,
  EditorBlockOutputDefinition,
  ExportOptions,
  ParsedPost,
  ParsedPostBodyNode,
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
  ParserBlockResult,
} from "../blocks/ParserNode.js"
import type { BaseBlock } from "../blocks/BaseBlock.js"

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
    const warnings: string[] = []
    const blocks: AstBlock[] = []
    const body: ParsedPostBodyNode[] = []

    const appendWarnings = (nextWarnings: string[]) => {
      warnings.push(...nextWarnings)
    }

    const appendBodyNodes = (nodes: ParsedPostBodyNode[]) => {
      body.push(...nodes)
    }

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

    const handleResult = ({
      result,
      parserBlock,
    }: {
      result: ParserBlockResult
      parserBlock: BaseBlock
    }) => {
      if (result.warnings) {
        appendWarnings(result.warnings)
      }

      if (result.status === "handled") {
        const selectedBlocks = result.blocks.map((parsedBlock) =>
          applyOutputSelection({
            parsedBlock,
            parserBlock,
          }),
        )
        blocks.push(...selectedBlocks)
        body.push(...createBodyNodesFromStructuredBlocks(selectedBlocks))
        return
      }

      if (result.status === "traverse") {
        result.nodes?.forEach(appendBlocksFromNode)
      }
    }

    const appendBlocksFromNode = (node: AnyNode) => {
      const context: ParserBlockConvertContext = {
        $,
        $node: $(node),
        node,
        sourceUrl,
        tags,
        options,
        appendBodyNodes,
        appendWarnings,
        ...moduleContext?.(node),
      }
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
      }

      handleResult({
        result: block.convert(convertContext),
        parserBlock: block,
      })
    }

    nodes.forEach(appendBlocksFromNode)

    return {
      blocks,
      body,
      warnings,
    }
  }
}
