import type { ParsedPost } from "../../shared/types.js"
import { unique } from "../../shared/utils.js"

export const reviewParsedPost = (parsedPost: ParsedPost) => {
  const warnings = [...parsedPost.warnings]
  const rawHtmlBlockCount = parsedPost.blocks.filter((block) => block.type === "rawHtml").length

  if (parsedPost.blocks.length === 0) {
    warnings.push("본문 블록이 비어 있습니다.")
  }

  if (rawHtmlBlockCount > 0) {
    warnings.push(`raw HTML fallback 블록 ${rawHtmlBlockCount}개가 포함됩니다.`)
  }

  return {
    warnings: unique(warnings),
  }
}
