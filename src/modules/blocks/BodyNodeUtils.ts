import type {
  AstBlock,
  ParsedPost,
  ParsedPostBodyNode,
  ParsedPostStructuredBodyNode,
} from "../../shared/Types.js"

const createStructuredBodyNode = (block: AstBlock): ParsedPostStructuredBodyNode => ({
  kind: "block",
  block,
})

export const createBodyNodesFromStructuredBlocks = (blocks: AstBlock[]): ParsedPostBodyNode[] =>
  blocks.map((block) => createStructuredBodyNode(block))

export const getParsedPostBodyNodes = (parsedPost: ParsedPost) => parsedPost.body

export const getStructuredBodyBlocks = (parsedPost: ParsedPost) =>
  getParsedPostBodyNodes(parsedPost)
    .filter((node): node is ParsedPostStructuredBodyNode => node.kind === "block")
    .map((node) => node.block)
