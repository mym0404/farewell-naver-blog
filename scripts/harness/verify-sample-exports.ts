import { sampleCorpus } from "../../src/shared/sample-corpus.js"
import {
  loadSampleFixture,
  renderSampleFixture,
} from "./lib/sample-fixtures.js"

const run = async () => {
  const failures: string[] = []

  for (const sample of sampleCorpus) {
    const fixture = await loadSampleFixture(sample)
    const rendered = await renderSampleFixture({
      sample,
      html: fixture.html,
    })

    for (const expectedCapabilityId of sample.expectedCapabilityIds) {
      if (!rendered.observedCapabilityIds.includes(expectedCapabilityId)) {
        failures.push(`${sample.id}: missing expected capability ${expectedCapabilityId}`)
      }
    }

    if (rendered.normalizedMarkdown !== fixture.expectedMarkdown) {
      failures.push(`${sample.id}: rendered markdown does not match expected.md`)
    }

    if (rendered.normalizedMarkdown.includes("(undefined)")) {
      failures.push(`${sample.id}: rendered markdown must not contain undefined asset references`)
    }

    if (
      new Set(rendered.rendered.assetRecords.map((record) => record.reference)).size !==
      rendered.rendered.assetRecords.length
    ) {
      failures.push(`${sample.id}: asset records must not contain duplicate references`)
    }

    if (rendered.rendered.assetRecords.some((record) => !record.reference)) {
      failures.push(`${sample.id}: asset records must have a renderable reference`)
    }
  }

  if (failures.length > 0) {
    throw new Error(failures.join("\n"))
  }

  console.log(`samples:verify passed (${sampleCorpus.length} samples)`)
}

void run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
