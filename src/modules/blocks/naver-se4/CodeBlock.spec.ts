import { describe, expect, it } from "vitest"

import {
  createSe4ModuleScript,
  expectEveryBlockOutputOption,
  parseSe4Blocks,
  parseSe4BlocksWithOptions,
} from "../../../../tests/helpers/parser-test-utils.js"

describe("NaverSe4CodeBlock", () => {
  it("parses code components with language metadata", () => {
    const parsed = parseSe4Blocks(`
      <div class="se-component se-code">
        ${createSe4ModuleScript({ type: "v2_code" })}
        <pre class="__se_code_view language-typescript">const value = 1
console.log(value)
</pre>
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "code",
        language: "typescript",
        code: "const value = 1\nconsole.log(value)",
        outputSelectionKey: "naver-se4:code",
        outputSelection: {
          variant: "backtick-fence",
        },
      },
    ])
  })

  it("skips code components with no code", () => {
    const parsed = parseSe4Blocks(`
      <div class="se-component se-code">
        ${createSe4ModuleScript({ type: "v2_code" })}
        <pre class="__se_code_view"></pre>
      </div>
    `)

    expect(parsed.blocks).toEqual([])
  })

  it("parses code components without language metadata", () => {
    const parsed = parseSe4Blocks(`
      <div class="se-component se-code">
        ${createSe4ModuleScript({ type: "v2_code" })}
        <pre class="__se_code_view">plain()</pre>
      </div>
    `)

    expect(parsed.blocks[0]).toMatchObject({
      type: "code",
      language: null,
      code: "plain()",
    })
  })

  it("applies every output option", () => {
    expectEveryBlockOutputOption({
      editorType: "naver-se4",
      blockId: "code",
      parse: (blockOutputs) =>
        parseSe4BlocksWithOptions({
          blockOutputs,
          components: [
            `
              <div class="se-component se-code">
                ${createSe4ModuleScript({ type: "v2_code" })}
                <pre class="__se_code_view">const value = 1</pre>
              </div>
            `,
          ],
        }),
    })
  })
})
