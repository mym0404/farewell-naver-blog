import { constants } from "node:fs"
import { access, readFile } from "node:fs/promises"

import { parserCapabilities } from "../../src/shared/ParserCapabilities.js"
import { sampleCorpus } from "../../src/shared/SampleCorpus.js"
import { buildGeneratedDocs } from "./lib/report-generation.js"
import { collectParserStatus } from "./lib/parser-status.js"
import { repoPath } from "./lib/paths.js"

const canUpdateGeneratedDoc = async (filePath: string) =>
  access(filePath, constants.W_OK)
    .then(() => true)
    .catch(() => false)

const run = async () => {
  const parserStatus = await collectParserStatus()
  const generatedDocs = await buildGeneratedDocs()
  const failures = [
    ...parserStatus.missingParserFixtureBlockTypes.map(
      (blockType) => `missing parser fixture: ${blockType}`,
    ),
    ...parserStatus.missingCapabilityTestMappings.map(
      (capabilityId) => `missing parser test mapping: ${capabilityId}`,
    ),
    ...parserStatus.invalidCapabilityTestFileLinks,
    ...parserStatus.invalidSampleLinks,
    ...parserStatus.invalidExpectedCapabilityIds,
    ...parserStatus.missingSampleSourceFixtures.map(
      (sampleId) => `missing sample source fixture: ${sampleId}`,
    ),
    ...parserStatus.missingSampleExpectedFixtures.map(
      (sampleId) => `missing sample expected fixture: ${sampleId}`,
    ),
    ...parserStatus.missingEditorCoverage.map(
      (editorVersion) => `missing sample corpus editor coverage: ${editorVersion}`,
    ),
  ]

  const staleDocChecks = [
    {
      label: "parser block catalog",
      filePath: repoPath(".agents", "knowledge", "architecture", "parser-block-catalog.md"),
      expected: generatedDocs.parserBlockCatalog,
    },
    {
      label: "sample corpus",
      filePath: repoPath(".agents", "knowledge", "product", "sample-corpus.md"),
      expected: generatedDocs.sampleCorpusDoc,
    },
    {
      label: "quality score",
      filePath: repoPath(".agents", "knowledge", "reference", "generated", "quality-score.md"),
      expected: generatedDocs.qualityScore,
    },
    {
      label: "sample coverage",
      filePath: repoPath(".agents", "knowledge", "reference", "generated", "sample-coverage.md"),
      expected: generatedDocs.sampleCoverage,
    },
  ]

  for (const staleDocCheck of staleDocChecks) {
    if (!(await canUpdateGeneratedDoc(staleDocCheck.filePath))) {
      continue
    }

    const currentContent = await readFile(staleDocCheck.filePath, "utf8").catch(() => null)

    if (currentContent !== staleDocCheck.expected) {
      failures.push(`stale markdown: ${staleDocCheck.label}`)
    }
  }

  if (parserCapabilities.length !== new Set(parserCapabilities.map((item) => item.id)).size) {
    failures.push("parser capability id must be unique")
  }

  if (sampleCorpus.length !== new Set(sampleCorpus.map((item) => item.id)).size) {
    failures.push("sample corpus id must be unique")
  }

  if (failures.length > 0) {
    throw new Error(failures.join("\n"))
  }

  console.log(
    `parser:check passed (${parserCapabilities.length} capabilities, ${sampleCorpus.length} samples, ${parserStatus.sampleGapCapabilityIds.length} sample gaps, ${parserStatus.parserFixtureOnlyCapabilityIds.length} parser-fixture only capabilities)`,
  )
}

void run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
