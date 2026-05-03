import { resolveBlockOutputSelection } from "../../../shared/BlockRegistry.js"
import type { BlockOutputSelection } from "../../../shared/Types.js"
import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockConvertContext, ParserBlockResult } from "../ParserNode.js"
import { NaverSe4ImageBlock } from "./ImageBlock.js"
import { NaverSe4TextBlock } from "./TextBlock.js"

const imageBlock = new NaverSe4ImageBlock()
const textBlock = new NaverSe4TextBlock()
const imageSelectionKey = "naver-se4:image"
const paragraphSelectionKey = "naver-se4:paragraph"

export class NaverSe4WrappingParagraphBlock extends LeafBlock {
  override readonly id = "wrappingParagraph"
  override readonly label = "감싼 문단"

  override match({ $node }: ParserBlockContext) {
    return $node.hasClass("se-wrappingParagraph")
  }

  override convert(context: ParserBlockConvertContext): ParserBlockResult {
    const { $node, options } = context
    const imageSlot = $node.find(".se-component-slot-float").first()
    const textSlot = $node.find(".se-component-slot").not(".se-component-slot-float").first()
    const imageSelection = resolveBlockOutputSelection({
      blockType: "image",
      outputOptions: imageBlock.outputOptions,
      blockOutputs: options.blockOutputs,
      selectionKey: imageSelectionKey,
    }) as BlockOutputSelection
    const paragraphSelection = resolveBlockOutputSelection({
      blockType: "paragraph",
      outputOptions: textBlock.outputOptions,
      blockOutputs: options.blockOutputs,
      selectionKey: paragraphSelectionKey,
    }) as BlockOutputSelection
    const imageBlocks =
      imageSlot.length > 0
        ? imageBlock.convert({ ...context, $node: imageSlot }).blocks.map((block) => ({
              ...block,
              outputSelectionKey: imageSelectionKey,
              outputSelection: imageSelection,
            }))
        : []
    const shouldAttachParagraphSelection = Boolean(options.blockOutputs.defaults?.[paragraphSelectionKey])
    const textBlocks =
      textSlot.length > 0
        ? textBlock
            .convert({
              ...context,
              $node: textSlot,
              outputSelection: paragraphSelection,
            })
            .blocks.map((block) =>
              shouldAttachParagraphSelection
                ? {
                    ...block,
                    outputSelectionKey: paragraphSelectionKey,
                    outputSelection: paragraphSelection,
                  }
                : block,
            )
        : []

    return {
      status: "handled",
      blocks: [...imageBlocks, ...textBlocks],
    }
  }
}
