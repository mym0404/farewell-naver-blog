import { describe, expect, it } from "vitest"

import { parseSe2Blocks } from "../../../../tests/helpers/parser-test-utils.js"

describe("NaverSe2CommentBlock", () => {
  it("skips standalone html comments", () => {
    const parsed = parseSe2Blocks("<!-- Not Allowed Attribute Filtered -->")

    expect(parsed.blocks).toEqual([])
  })

  it("skips html comments inside nested legacy wrappers", () => {
    const parsed = parseSe2Blocks(`
      <div>
        <!--__se_object_end -->
        <p>본문</p>
      </div>
    `)

    expect(parsed.blocks).toEqual([{ type: "paragraph", text: "본문" }])
  })
})
