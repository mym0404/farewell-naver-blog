import { describe, expect, it } from "vitest"
import { createLinkParagraphBlocks } from "./LinkParagraph.js"

describe("createLinkParagraphBlocks", () => {
  it("falls back to the url when a link card has no title", () => {
    expect(
      createLinkParagraphBlocks({
        title: "",
        description: "",
        url: "https://example.com/no-title",
        hasThumbnail: true,
      }),
    ).toEqual([
      {
        type: "paragraph",
        text: "[https://example.com/no-title](https://example.com/no-title)",
      },
    ])
  })
})
