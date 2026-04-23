import { getParserCapabilityId, parserCapabilityCatalog } from "./block-registry.js"
import {
  getConfirmedUnsupportedBlockCaseCandidateDefinition,
  getUnsupportedBlockCaseIdByWarningText,
} from "./unsupported-block-cases.js"

import type {
  AstBlock,
  EditorVersion,
  ParserCapability,
  ParserCapabilityId,
  ParserCapabilityLookupId,
  UnsupportedBlockCaseResolutionRule,
  UnsupportedBlockCaseCapabilityId,
  UnsupportedBlockCaseId,
  UnsupportedBlockInstance,
} from "./types.js"

export { getParserCapabilityId }

type UnsupportedBlockCaseCapabilityBinding = Pick<
  UnsupportedBlockCaseResolutionRule,
  "caseId" | "processingScope"
> & {
  capabilityId: ParserCapabilityId
}

type UnsupportedBlockCaseCapabilityResolution = UnsupportedBlockCaseResolutionRule & {
  capabilityId: ParserCapabilityId
}

const unsupportedBlockCaseCapabilityBindings: UnsupportedBlockCaseCapabilityBinding[] = [
  {
    capabilityId: "se2-rawHtml",
    caseId: "se2-inline-gif-video",
    processingScope: "block-unit",
  },
  {
    capabilityId: "se3-paragraph",
    caseId: "se3-horizontal-line-default",
    processingScope: "block-unit",
  },
  {
    capabilityId: "se3-paragraph",
    caseId: "se3-horizontal-line-line5",
    processingScope: "block-unit",
  },
  {
    capabilityId: "se3-paragraph",
    caseId: "se3-oglink-og_bSize",
    processingScope: "block-unit",
  },
]

export const unsupportedBlockCaseCapabilityResolutions: UnsupportedBlockCaseCapabilityResolution[] =
  unsupportedBlockCaseCapabilityBindings.map((binding) => {
    const confirmedCandidate = getConfirmedUnsupportedBlockCaseCandidateDefinition(binding.caseId)

    if (!confirmedCandidate) {
      throw new Error(`missing confirmed unsupported block candidate: ${binding.caseId}`)
    }

    return {
      ...binding,
      confirmedCandidateId: confirmedCandidate.id,
      resolution: confirmedCandidate.resolution,
    }
  })

const unsupportedBlockCaseResolutionMap = new Map<ParserCapabilityId, UnsupportedBlockCaseResolutionRule[]>()
const unsupportedBlockCaseCapabilityResolutionByCaseId = new Map<
  UnsupportedBlockCaseId,
  UnsupportedBlockCaseCapabilityResolution
>()

for (const resolution of unsupportedBlockCaseCapabilityResolutions) {
  const currentRules = unsupportedBlockCaseResolutionMap.get(resolution.capabilityId) ?? []

  currentRules.push({
    caseId: resolution.caseId,
    confirmedCandidateId: resolution.confirmedCandidateId,
    resolution: resolution.resolution,
    processingScope: resolution.processingScope,
  })

  unsupportedBlockCaseResolutionMap.set(resolution.capabilityId, currentRules)
  unsupportedBlockCaseCapabilityResolutionByCaseId.set(resolution.caseId, resolution)
}

export const getUnsupportedBlockCaseCapabilityLookupId = (
  caseId: UnsupportedBlockCaseId,
): UnsupportedBlockCaseCapabilityId => `case:${caseId}`

export const getUnsupportedBlockCaseCapabilityResolution = (caseId: UnsupportedBlockCaseId) =>
  unsupportedBlockCaseCapabilityResolutionByCaseId.get(caseId)

export const getParserCapabilityLookupIds = ({
  editorVersion,
  blocks,
  warnings,
  unsupportedBlocks,
}: {
  editorVersion: EditorVersion
  blocks: AstBlock[]
  warnings: string[]
  unsupportedBlocks?: UnsupportedBlockInstance[]
}) => {
  const sourceCapabilityUsage = new Map<ParserCapabilityId, number>()
  const resolvedCaseUsage = new Map<UnsupportedBlockCaseId, number>()
  const structuredUnsupportedBlockIndexes = new Set<number>()

  if (unsupportedBlocks && unsupportedBlocks.length > 0) {
    unsupportedBlocks.forEach((unsupportedBlock) => {
      const blockCount = unsupportedBlock.blockCount ?? 1

      for (let offset = 0; offset < blockCount; offset += 1) {
        structuredUnsupportedBlockIndexes.add(unsupportedBlock.blockIndex + offset)
      }
    })
  }

  blocks.forEach((block, blockIndex) => {
    if (structuredUnsupportedBlockIndexes.has(blockIndex)) {
      return
    }

    if (block.type === "htmlFragment") {
      return
    }

    const capabilityId = getParserCapabilityId({
      editorVersion,
      blockType: block.type,
    })

    sourceCapabilityUsage.set(capabilityId, (sourceCapabilityUsage.get(capabilityId) ?? 0) + 1)
  })

  if (unsupportedBlocks && unsupportedBlocks.length > 0) {
    unsupportedBlocks.forEach(({ caseId }) => {
      resolvedCaseUsage.set(caseId, (resolvedCaseUsage.get(caseId) ?? 0) + 1)
    })
  } else {
    warnings.forEach((warning) => {
      const caseId = getUnsupportedBlockCaseIdByWarningText(warning)

      if (!caseId) {
        return
      }

      resolvedCaseUsage.set(caseId, (resolvedCaseUsage.get(caseId) ?? 0) + 1)
    })
  }

  const lookupIds: ParserCapabilityLookupId[] = []

  sourceCapabilityUsage.forEach((_, capabilityId) => {
    lookupIds.push(capabilityId)
  })

  resolvedCaseUsage.forEach((_, caseId) => {
    lookupIds.push(getUnsupportedBlockCaseCapabilityLookupId(caseId))
  })

  return lookupIds
}

export const parserCapabilities: ParserCapability[] = parserCapabilityCatalog.map((capability) => {
  const id = getParserCapabilityId({
    editorVersion: capability.editorVersion,
    blockType: capability.blockType,
  })
  const unsupportedBlockCaseResolutions = unsupportedBlockCaseResolutionMap.get(id)

  return {
    id,
    ...capability,
    ...(unsupportedBlockCaseResolutions
      ? {
          unsupportedBlockCaseResolutions,
        }
      : {}),
  }
})
