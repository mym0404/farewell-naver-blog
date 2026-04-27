import type { CheerioAPI } from "cheerio"

import { compactText } from "../../../../shared/Utils.js"

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

export const shouldTraverseNestedBlocks = ({
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
