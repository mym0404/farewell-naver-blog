import { describe, expect, it } from "vitest"

import {
  createFailureBlockLabel,
  createParserSupportPrTitle,
  createSupportUnitClaim,
  hasSupportUnitClaim,
  parseSupportUnitClaim,
} from "./ingest-pr-claims.js"

describe("ingest PR claims", () => {
  it("detects duplicate support unit claims from PR bodies", () => {
    const claim = createSupportUnitClaim("editor:content-shape")

    expect(parseSupportUnitClaim(`body\n${claim}\n`)).toBe("editor:content-shape")
    expect(
      hasSupportUnitClaim({
        supportUnitKey: "editor:content-shape",
        pullRequests: [{ body: claim }, { body: "<!-- ingest-blog:supportUnitKey=editor:other-content -->" }],
      }),
    ).toBe(true)
  })

  it("formats PR title and failure block label", () => {
    expect(createParserSupportPrTitle("Support parser content")).toBe("[Parser Support] Support parser content")
    expect(createParserSupportPrTitle("[Parser Support] Support parser content")).toBe(
      "[Parser Support] Support parser content",
    )
    expect(createFailureBlockLabel("a1b2c3d4")).toBe("failure-block:a1b2c3d4")
  })
})
