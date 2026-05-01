import type { CheerioAPI } from "cheerio"

import { ContainerBlock } from "../BaseBlock.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"
import { compactText } from "../../../shared/Utils.js"

const nestedBlockContainerTags = new Set(["div", "span", "font"])
const spacerContainerTags = new Set(["p", "div", "span", "font", "b", "strong", "i", "em", "u"])
const nestedBlockTags = new Set([
  "p",
  "div",
  "table",
  "blockquote",
  "hr",
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
])

const shouldTraverseNestedBlocks = ({
  element,
  tagName,
}: {
  element: ReturnType<CheerioAPI>
  tagName: string
}) => {
  if (!nestedBlockContainerTags.has(tagName)) {
    return false
  }

  const childNodes = element.contents().toArray()
  const hasMeaningfulDirectText = childNodes.some(
    /* v8 ignore next */
    (node) => node.type === "text" && compactText(node.data ?? "") !== "",
  )

  if (hasMeaningfulDirectText) {
    return false
  }

  return childNodes.some(
    (node) => node.type === "tag" && nestedBlockTags.has(node.tagName.toLowerCase()),
  )
}

export const isSpacerBlock = ({
  element,
  tagName,
}: {
  element: ReturnType<CheerioAPI>
  tagName: string
}) => {
  if (!spacerContainerTags.has(tagName)) {
    return false
  }

  const clone = element.clone()

  clone.find("br").remove()

  if (clone.find("img,iframe,video,table").length > 0) {
    return false
  }

  return compactText(clone.text()) === ""
}

export class NaverSe2ContainerBlock extends ContainerBlock {
  override readonly id = "container"
  override readonly label = "중첩 컨테이너"

  override match({ node, $node }: ParserBlockContext) {
    return (
      node.type === "tag" &&
      shouldTraverseNestedBlocks({
        element: $node,
        tagName: node.tagName.toLowerCase(),
      })
    )
  }

  override convert({ $node }: Parameters<ContainerBlock["convert"]>[0]): ParserBlockResult {
    return {
      status: "traverse",
      nodes: $node.contents().toArray(),
    }
  }
}
