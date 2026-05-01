import { describe, expect, it } from "vitest"

import { expectEveryBlockOutputOption, parseSe2Blocks } from "../parser-test-utils.js"

describe("NaverSe2DividerBlock", () => {
  it("parses hr tags into divider blocks", () => {
    const parsed = parseSe2Blocks("<hr />")

    expect(parsed.blocks).toEqual([
      {
        type: "divider",
        outputSelectionKey: "naver-se2:divider",
        outputSelection: {
          variant: "dash-rule",
        },
      },
    ])
  })

  it("applies every output option", () => {
    expectEveryBlockOutputOption({
      editorType: "naver-se2",
      blockId: "divider",
      parse: (blockOutputs) => parseSe2Blocks("<hr />", { blockOutputs }),
    })
  })
})
