import { LeafBlock } from "../ParserNode.js"

export const getComponentHtml = ({
  $,
  $node,
}: {
  $: Parameters<LeafBlock["convert"]>[0]["$"]
  $node: Parameters<LeafBlock["convert"]>[0]["$node"]
}) => {
  const clone = $node.clone()
  clone.find("script.__se_module_data").remove()

  return $.html(clone).trim()
}
