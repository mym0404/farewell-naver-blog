import { describe, expect, it } from "vitest"

import { parseSe2Blocks } from "../parser-test-utils.js"

describe("NaverSe2ContainerBlock", () => {
  it("unwraps malformed inline wrappers that only contain nested block nodes", () => {
    const parsed = parseSe2Blocks(`
      <span>
        <div><p>첫 문단</p></div>
        <div><p>둘째 문단</p></div>
        <div><pre>const nested = true</pre></div>
      </span>
    `)

    expect(parsed.blocks).toEqual([
      { type: "paragraph", text: "첫 문단" },
      { type: "paragraph", text: "둘째 문단" },
      {
        type: "code",
        language: null,
        code: "const nested = true",
        outputSelectionKey: "naver-se2:code",
        outputSelection: {
          variant: "backtick-fence",
        },
      },
    ])
  })

  it("does not treat image-only wrappers as spacers", () => {
    expect(() => parseSe2Blocks(`<p><img alt="" /></p>`)).toThrow(
      "파싱 가능한 naver-se2 block이 없습니다: p",
    )
  })
})
