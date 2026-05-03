import { describe, expect, it } from "vitest"

import {
  expectEveryBlockOutputOption,
  parseSe3Blocks,
  parseSe3BlocksWithOptions,
} from "../../../../tests/helpers/parser-test-utils.js"

describe("NaverSe3CodeBlock", () => {
  it("parses code components into code blocks", () => {
    const parsed = parseSe3Blocks(`
      <div class="se_component se_code">
        <pre>const legacy = true
console.log(legacy)
</pre>
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "code",
        language: null,
        code: "const legacy = true\nconsole.log(legacy)",
        outputSelectionKey: "naver-se3:code",
        outputSelection: {
          variant: "backtick-fence",
        },
      },
    ])
  })

  it("skips code components with no code", () => {
    const parsed = parseSe3Blocks(`
      <div class="se_component se_code">
        <pre></pre>
      </div>
    `)

    expect(parsed.blocks).toEqual([])
  })

  it("applies every output option", () => {
    expectEveryBlockOutputOption({
      editorType: "naver-se3",
      blockId: "code",
      parse: (blockOutputs) =>
        parseSe3BlocksWithOptions({
          blockOutputs,
          components: [
            `
              <div class="se_component se_code">
                <pre>const value = 1</pre>
              </div>
            `,
          ],
        }),
    })
  })
})
