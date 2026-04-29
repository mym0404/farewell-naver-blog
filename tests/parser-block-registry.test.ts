import { describe, expect, it } from "vitest"

import { NaverBlog } from "../src/modules/blog/NaverBlog.js"
import { blockOutputFamilyDefinitions } from "../src/shared/BlockRegistry.js"

describe("parser block catalog", () => {
  it("keeps Naver editor instances and block output families unique", () => {
    const blog = new NaverBlog()
    const outputTypes = blockOutputFamilyDefinitions.map((family) => family.astBlockType)

    expect(blog.editors).toHaveLength(3)
    expect(outputTypes).toHaveLength(new Set(outputTypes).size)
    expect(outputTypes).toEqual(
      expect.arrayContaining([
        "paragraph",
        "heading",
        "quote",
        "divider",
        "code",
        "formula",
        "image",
        "imageGroup",
        "video",
        "linkCard",
        "table",
      ]),
    )
  })
})
