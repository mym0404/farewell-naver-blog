import type { ParsedPost } from "../../shared/Types.js"
import { unique } from "../../shared/Utils.js"
import { getParsedPostBodyNodes } from "../blocks/BodyNodeUtils.js"

export const reviewParsedPost = (parsedPost: ParsedPost) => {
  const bodyNodes = getParsedPostBodyNodes(parsedPost)
  const warnings = [...parsedPost.warnings]

  if (bodyNodes.length === 0) {
    warnings.push("본문 블록이 비어 있습니다.")
  }

  return {
    warnings: unique(warnings),
  }
}
