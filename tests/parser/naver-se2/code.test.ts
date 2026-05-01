import { describe, expect, it } from "vitest"

import { expectEveryBlockOutputOption, parseSe2Blocks } from "../parser-test-utils.js"

describe("NaverSe2CodeBlock", () => {
  it("parses pre tags into code blocks", () => {
    const parsed = parseSe2Blocks(`<pre>const oldSchool = true
console.log(oldSchool)
</pre>`)

    expect(parsed.blocks).toEqual([
      {
        type: "code",
        language: null,
        code: "const oldSchool = true\nconsole.log(oldSchool)",
        outputSelectionKey: "naver-se2:code",
        outputSelection: {
          variant: "backtick-fence",
        },
      },
    ])
  })

  it("skips pre tags with no code", () => {
    const parsed = parseSe2Blocks("<pre></pre>")

    expect(parsed.blocks).toEqual([])
  })

  it("applies every output option", () => {
    expectEveryBlockOutputOption({
      editorType: "naver-se2",
      blockId: "code",
      parse: (blockOutputs) => parseSe2Blocks("<pre>const value = 1</pre>", { blockOutputs }),
    })
  })
})
