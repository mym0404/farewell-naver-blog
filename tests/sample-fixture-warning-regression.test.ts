import { describe, expect, it } from "vitest"

import { sampleCorpus } from "../src/shared/sample-corpus.js"
import {
  loadSampleFixture,
  renderSampleFixture,
} from "../scripts/harness/lib/sample-fixtures.js"

const unsupportedResolutionSamples = sampleCorpus.filter((sample) =>
  sample.expectedCapabilityLookupIds.some((lookupId) => lookupId.startsWith("case:")),
)

describe("sample fixture unsupported warning regression", () => {
  it.each(unsupportedResolutionSamples)(
    "keeps $id warning-free after unsupported block normalization",
    async (sample) => {
      const fixture = await loadSampleFixture(sample)
      const rendered = await renderSampleFixture({
        sample,
        html: fixture.html,
      })

      expect(rendered.parsedPost.unsupportedBlocks ?? []).toEqual([])
      expect(rendered.parsedPost.warnings).toEqual([])
      expect(rendered.reviewWarnings).toEqual([])
      expect(rendered.rendered.warnings).toEqual([])
    },
  )
})
