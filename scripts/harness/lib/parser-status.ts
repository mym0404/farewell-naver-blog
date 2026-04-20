import path from "node:path"

import { parserCapabilities } from "../../../src/shared/parser-capabilities.js"
import { sampleCorpus } from "../../../src/shared/sample-corpus.js"
import type { BlockType, EditorVersion, ParserCapabilityId } from "../../../src/shared/types.js"
import { pathExists, readUtf8, repoPath, walkFiles } from "./paths.js"

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const collectParserStatus = async () => {
  const parserFixtureDir = repoPath("tests", "fixtures", "parser")
  const sampleFixtureDir = repoPath("tests", "fixtures", "samples")
  const parserFixtureFiles = (await pathExists(parserFixtureDir))
    ? (await walkFiles(parserFixtureDir)).filter((filePath) => filePath.endsWith(".html"))
    : []
  const parserFixtureBlockTypes = new Set(
    parserFixtureFiles.map((filePath) => path.basename(filePath, ".html")),
  )
  const testFiles = (await walkFiles(repoPath("tests")))
    .filter((filePath) => filePath.endsWith(".test.ts"))
    .sort()
  const testContent = (await Promise.all(testFiles.map((filePath) => readUtf8(filePath)))).join("\n")
  const sampleById = new Map(sampleCorpus.map((sample) => [sample.id, sample]))
  const capabilityIdSet = new Set(parserCapabilities.map((capability) => capability.id))
  const sampleFixtureCapabilities = parserCapabilities.filter(
    (capability) => capability.verificationMode === "sample-fixture",
  )
  const parserFixtureOnlyCapabilityIds = parserCapabilities
    .filter((capability) => capability.verificationMode === "parser-fixture")
    .map((capability) => capability.id)
  const blockTypes = Array.from(
    new Set(parserCapabilities.map((capability) => capability.blockType)),
  ) as BlockType[]
  const missingParserFixtureBlockTypes: BlockType[] = []
  const missingTestBlockTypes: BlockType[] = []
  const sampleGapCapabilityIds: ParserCapabilityId[] = []
  const invalidSampleLinks: string[] = []
  const invalidExpectedCapabilityIds: string[] = []
  const missingSampleSourceFixtures: string[] = []
  const missingSampleExpectedFixtures: string[] = []

  for (const blockType of blockTypes) {
    if (!parserFixtureBlockTypes.has(blockType)) {
      missingParserFixtureBlockTypes.push(blockType)
    }

    const testPattern = new RegExp(`type:\\s*"${escapeRegex(blockType)}"`)

    if (!testPattern.test(testContent)) {
      missingTestBlockTypes.push(blockType)
    }
  }

  for (const capability of parserCapabilities) {
    if (capability.verificationMode === "sample-fixture" && capability.sampleIds.length === 0) {
      sampleGapCapabilityIds.push(capability.id)
    }

    for (const sampleId of capability.sampleIds) {
      const sample = sampleById.get(sampleId)

      if (!sample) {
        invalidSampleLinks.push(`${capability.id}: missing sample ${sampleId}`)
        continue
      }

      if (!sample.expectedCapabilityIds.includes(capability.id)) {
        invalidSampleLinks.push(
          `${capability.id}: sample ${sampleId} does not declare the capability in expectedCapabilityIds`,
        )
      }
    }
  }

  for (const sample of sampleCorpus) {
    for (const capabilityId of sample.expectedCapabilityIds) {
      if (!capabilityIdSet.has(capabilityId)) {
        invalidExpectedCapabilityIds.push(
          `${sample.id}: expected capability ${capabilityId} is not declared in parserCapabilities`,
        )
      }
    }

    const sourcePath = path.join(sampleFixtureDir, sample.id, "source.html")
    const expectedPath = path.join(sampleFixtureDir, sample.id, "expected.md")

    if (!(await pathExists(sourcePath))) {
      missingSampleSourceFixtures.push(sample.id)
    }

    if (!(await pathExists(expectedPath))) {
      missingSampleExpectedFixtures.push(sample.id)
    }
  }

  const editorCoverage = ([2, 3, 4] as EditorVersion[]).filter(
    (editorVersion) => !sampleCorpus.some((sample) => sample.editorVersion === editorVersion),
  )
  const capabilityCoverageBySample = Object.fromEntries(
    parserCapabilities.map((capability) => [capability.id, capability.sampleIds]),
  ) satisfies Record<ParserCapabilityId, string[]>

  return {
    missingParserFixtureBlockTypes,
    missingTestBlockTypes,
    sampleGapCapabilityIds,
    invalidSampleLinks,
    invalidExpectedCapabilityIds,
    missingSampleSourceFixtures,
    missingSampleExpectedFixtures,
    missingEditorCoverage: editorCoverage,
    capabilityCoverageBySample,
    parserFixtureOnlyCapabilityIds,
    parserBlockFixtureCoverageCount: blockTypes.length - missingParserFixtureBlockTypes.length,
    parserBlockTestCoverageCount: blockTypes.length - missingTestBlockTypes.length,
    parserBlockTotal: blockTypes.length,
    parserCapabilitySampleCoverageCount: sampleFixtureCapabilities.length - sampleGapCapabilityIds.length,
    parserCapabilitySampleTotal: sampleFixtureCapabilities.length,
  }
}
