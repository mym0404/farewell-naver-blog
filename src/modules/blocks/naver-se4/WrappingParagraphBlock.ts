import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"
import { parseImageLink, se4ImageLinkSelector } from "./ImageLink.js"
import { parseTextBlocks } from "./TextBlock.js"

export class NaverSe4WrappingParagraphBlock extends LeafBlock {
  override readonly id = "wrappingParagraph"
  override readonly label = "감싸는 문단"

  override match({ $node }: ParserBlockContext) {
    return $node.hasClass("se-wrappingParagraph") && $node.hasClass("se-l-inner-big-right")
  }

  override convert({ $node, options }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const image = parseImageLink($node.find(".se-component-slot-float").find(se4ImageLinkSelector).first())

    if (!image) {
      throw new Error("SE4 wrapping paragraph image parsing failed.")
    }

    const $textSlot = $node.find(".se-component-slot").not(".se-component-slot-float").first()

    return {
      status: "handled",
      blocks: [
        { type: "image", image },
        ...parseTextBlocks({
          $node: $textSlot,
          options,
        }),
      ],
    }
  }
}
