import { describe, expect, it } from "vitest"

import {
  createFailureBlockLabel,
  createNewBlockPrTitle,
  createSupportUnitClaim,
  hasSupportUnitClaim,
  parseSupportUnitClaim,
} from "./ingest-pr-claims.js"

describe("ingest PR claims", () => {
  it("detects duplicate support unit claims from PR bodies", () => {
    const claim = createSupportUnitClaim("naver-se4:v2_poll")

    expect(parseSupportUnitClaim(`body\n${claim}\n`)).toBe("naver-se4:v2_poll")
    expect(
      hasSupportUnitClaim({
        supportUnitKey: "naver-se4:v2_poll",
        pullRequests: [{ body: claim }, { body: "<!-- ingest-blog:supportUnitKey=naver-se4:v2_map -->" }],
      }),
    ).toBe(true)
  })

  it("formats PR title and failure block label", () => {
    expect(createNewBlockPrTitle("Support SE4 poll block")).toBe("[📦 New Block] Support SE4 poll block")
    expect(createNewBlockPrTitle("[📦 New Block] Support SE4 poll block")).toBe("[📦 New Block] Support SE4 poll block")
    expect(createFailureBlockLabel("a1b2c3d4")).toBe("failure-block:a1b2c3d4")
  })
})
