import { describe, expect, it } from "vitest"

import { reviewParsedPost } from "../src/modules/reviewer/PostReviewer.js"
import type { ParsedPost } from "../src/shared/Types.js"

const createParsedPost = (overrides: Partial<ParsedPost> = {}): ParsedPost => {
  const blocks = overrides.blocks ?? [{ type: "paragraph" as const, text: "ok" }]

  return {
    tags: [],
    videos: [],
    warnings: [],
    ...overrides,
    blocks,
    body: overrides.body ?? blocks.map((block) => ({ kind: "block", block })),
  }
}

describe("reviewParsedPost", () => {
  it("keeps parser warnings", () => {
    const reviewed = reviewParsedPost(
      createParsedPost({
        warnings: ["parser warning"],
        blocks: [
          { type: "paragraph", text: "body" },
        ],
        body: [
          { kind: "block", block: { type: "paragraph", text: "body" } },
        ],
      }),
    )

    expect(reviewed.warnings).toEqual(["parser warning"])
  })

  it("warns when the parsed body is empty", () => {
    const reviewed = reviewParsedPost(
      createParsedPost({
        blocks: [],
      }),
    )

    expect(reviewed.warnings).toContain("본문 블록이 비어 있습니다.")
  })
})
