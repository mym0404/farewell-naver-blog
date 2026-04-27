import { describe, expect, it } from "vitest"

import { blogEditors, blogs } from "../src/modules/blog/BlogRegistry.js"

describe("parser block registry", () => {
  it("keeps editors owned by a blog with unique parser blocks", () => {
    const editorIds = new Set(blogEditors.map((editor) => editor.id))
    const parserBlockIds = blogEditors.flatMap((editor) => editor.supportedBlocks)

    expect(blogs).toEqual([
      {
        id: "naver",
        editors: ["naver.se2", "naver.se3", "naver.se4"],
      },
    ])
    expect(blogs.every((blog) => blog.editors.every((editorId) => editorIds.has(editorId)))).toBe(true)
    expect(parserBlockIds).toHaveLength(new Set(parserBlockIds).size)
    expect(parserBlockIds.some((parserBlockId) => parserBlockId.includes("rawHtml"))).toBe(false)
  })
})
