import { describe, expect, it } from "vitest"

import {
  defaultUnsupportedBlockCaseSelections,
  getUnsupportedBlockCaseDefinition,
} from "../src/shared/unsupported-block-cases.js"
import { sampleCorpus } from "../src/shared/sample-corpus.js"
import { readUtf8, repoPath } from "../scripts/harness/lib/paths.js"
import {
  loadSampleFixture,
  renderSampleFixture,
} from "../scripts/harness/lib/sample-fixtures.js"
import { unsupportedBlockFixtureEvidence } from "../scripts/harness/lib/unsupported-block-fixture-evidence.js"

type CaptureManifest = {
  caseId: string
  captureId: string
  sampleId: string
  warning: {
    text: string
  }
  locator: {
    sourceFile: string
    sourceLine: number
    cssSelector: string
    previousTextAnchor: string
    nextTextAnchor: string
  }
  references: {
    fixtureEvidenceFile?: string
    fixtureEvidenceId?: string
  }
}

const getLineSlice = ({
  content,
  startLine,
  lineCount,
}: {
  content: string
  startLine: number
  lineCount: number
}) =>
  content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .slice(startLine - 1, startLine - 1 + lineCount)

const normalizeSpace = (value: string) => value.replace(/\s+/g, " ").trim()

describe("unsupported block fixture evidence", () => {
  it("keeps every capture manifest wired to the reproducible fixture bundle", async () => {
    for (const evidence of unsupportedBlockFixtureEvidence) {
      const sample = sampleCorpus.find((candidate) => candidate.id === evidence.sampleId)
      const definition = getUnsupportedBlockCaseDefinition(evidence.caseId)
      const capture = JSON.parse(
        await readUtf8(repoPath(evidence.captureManifestPath)),
      ) as CaptureManifest

      expect(sample).toBeDefined()
      expect(definition).toBeDefined()
      expect(capture.caseId).toBe(evidence.caseId)
      expect(capture.captureId).toBe(evidence.captureId)
      expect(capture.sampleId).toBe(evidence.sampleId)
      expect(capture.warning.text).toBe(evidence.parserInput.warningText)
      expect(capture.locator.sourceFile).toBe(evidence.sourceHtml.file)
      expect(capture.locator.sourceLine).toBe(evidence.sourceHtml.line)
      expect(capture.locator.cssSelector).toBe(evidence.sourceHtml.selector)
      expect(capture.locator.previousTextAnchor).toBe(evidence.sourceHtml.previousTextAnchor)
      expect(capture.locator.nextTextAnchor).toBe(evidence.sourceHtml.nextTextAnchor)
      expect(capture.references.fixtureEvidenceFile).toBe(
        "scripts/harness/lib/unsupported-block-fixture-evidence.ts",
      )
      expect(capture.references.fixtureEvidenceId).toBe(evidence.caseId)
      expect(sample?.post.source).toBe(evidence.parserInput.sourceUrl)
      expect(sample?.editorVersion).toBe(evidence.parserInput.editorVersion)
      expect(definition?.selector).toBe(evidence.sourceHtml.selector)
      expect(definition?.warningText).toBe(evidence.parserInput.warningText)
      expect(defaultUnsupportedBlockCaseSelections[evidence.caseId].candidateId).toBe(
        evidence.expectedObservation.selectionCandidateId,
      )
    }
  })

  it("replays source fixtures and re-finds the stored observations", async () => {
    for (const evidence of unsupportedBlockFixtureEvidence) {
      const sample = sampleCorpus.find((candidate) => candidate.id === evidence.sampleId)

      expect(sample).toBeDefined()

      if (!sample) {
        throw new Error(`missing sample fixture for ${evidence.sampleId}`)
      }

      const fixture = await loadSampleFixture(sample)
      const rendered = await renderSampleFixture({
        sample,
        html: fixture.html,
      })
      const normalizedHtml = normalizeSpace(fixture.html)
      const normalizedSnippet = normalizeSpace(evidence.sourceHtml.snippet)
      const sourceSnippetIndex = normalizedHtml.indexOf(normalizedSnippet)
      const previousAnchorIndex = normalizedHtml.indexOf(
        normalizeSpace(evidence.sourceHtml.previousTextAnchor),
      )
      const nextAnchorIndex = normalizedHtml.indexOf(
        normalizeSpace(evidence.sourceHtml.nextTextAnchor),
      )

      expect(sourceSnippetIndex).toBeGreaterThanOrEqual(0)
      expect(previousAnchorIndex).toBeGreaterThanOrEqual(0)
      expect(nextAnchorIndex).toBeGreaterThan(sourceSnippetIndex)
      expect(previousAnchorIndex).toBeLessThan(sourceSnippetIndex)
      expect(rendered.observedCapabilityLookupIds).toContain(
        evidence.parserInput.expectedCapabilityLookupId,
      )

      evidence.expectedObservation.resolvedBlockTypes.forEach((blockType) => {
        expect(rendered.parsedPost.blocks.some((block) => block.type === blockType)).toBe(true)
      })

      expect(
        getLineSlice({
          content: fixture.expectedMarkdown,
          startLine: evidence.expectedObservation.markdownLine,
          lineCount: evidence.expectedObservation.markdownLines.length,
        }),
      ).toEqual(evidence.expectedObservation.markdownLines)

      expect(
        getLineSlice({
          content: rendered.normalizedMarkdown,
          startLine: evidence.expectedObservation.markdownLine,
          lineCount: evidence.expectedObservation.markdownLines.length,
        }),
      ).toEqual(evidence.expectedObservation.markdownLines)
    }
  })
})
