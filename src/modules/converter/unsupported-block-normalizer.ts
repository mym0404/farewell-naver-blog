import { resolveUnsupportedBlockCaseSelection } from "../../shared/unsupported-block-cases.js"
import { buildUnsupportedBlockCaseBlocks } from "../../shared/unsupported-block-resolution.js"
import type { AstBlock, ExportOptions, ParsedPost } from "../../shared/types.js"
import { unique } from "../../shared/utils.js"

export const normalizeUnsupportedBlocks = ({
  parsedPost,
  options,
}: {
  parsedPost: ParsedPost
  options: Pick<ExportOptions, "unsupportedBlockCases">
}): ParsedPost => {
  if (!parsedPost.unsupportedBlocks || parsedPost.unsupportedBlocks.length === 0) {
    return parsedPost
  }

  const unsupportedBlockMap = new Map(
    parsedPost.unsupportedBlocks.map((unsupportedBlock) => [unsupportedBlock.blockIndex, unsupportedBlock] as const),
  )
  const resolvedBlockIndexes = new Set<number>()
  const resolvedWarningTexts = new Set<string>()
  const skipBlockIndexes = new Set<number>()
  const blocks = parsedPost.blocks.flatMap((block, blockIndex) => {
    if (skipBlockIndexes.has(blockIndex)) {
      return []
    }

    const unsupportedBlock = unsupportedBlockMap.get(blockIndex)

    if (!unsupportedBlock) {
      return [block]
    }

    const selection = resolveUnsupportedBlockCaseSelection({
      caseId: unsupportedBlock.caseId,
      unsupportedBlockCases: options.unsupportedBlockCases,
    })

    const normalizedBlocks = buildUnsupportedBlockCaseBlocks({
      unsupportedBlock,
      candidateId: selection.candidateId,
    })

    if (normalizedBlocks.length === 0) {
      return [block]
    }

    const blockCount = unsupportedBlock.blockCount ?? 1

    for (let offset = 0; offset < blockCount; offset += 1) {
      const currentIndex = blockIndex + offset

      resolvedBlockIndexes.add(currentIndex)

      if (offset > 0) {
        skipBlockIndexes.add(currentIndex)
      }
    }

    resolvedWarningTexts.add(unsupportedBlock.warningText)

    return normalizedBlocks
  })
  const warnings = parsedPost.warnings.filter((warning) => !resolvedWarningTexts.has(warning))
  const unsupportedBlocks = parsedPost.unsupportedBlocks.filter(
    (unsupportedBlock) => !resolvedBlockIndexes.has(unsupportedBlock.blockIndex),
  )

  return {
    ...parsedPost,
    blocks,
    unsupportedBlocks,
    warnings: unique(warnings),
    videos: blocks
      .filter((block): block is Extract<AstBlock, { type: "video" }> => block.type === "video")
      .map((block) => block.video),
  }
}
