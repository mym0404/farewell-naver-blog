import { describe, expect, it } from "vitest"

import { expectEveryBlockOutputOption, parseSe4Blocks, parseSe4BlocksWithOptions } from "../parser-test-utils.js"

describe("NaverSe4DividerBlock", () => {
  it("parses horizontal line components into divider blocks", () => {
    const parsed = parseSe4Blocks(`
      <div class="se-component se-horizontalLine"></div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "divider",
        outputSelectionKey: "naver-se4:divider",
        outputSelection: {
          variant: "dash-rule",
        },
      },
    ])
  })

  it("applies every output option", () => {
    expectEveryBlockOutputOption({
      editorType: "naver-se4",
      blockId: "divider",
      parse: (blockOutputs) =>
        parseSe4BlocksWithOptions({
          blockOutputs,
          components: [`<div class="se-component se-horizontalLine"></div>`],
        }),
    })
  })
})
