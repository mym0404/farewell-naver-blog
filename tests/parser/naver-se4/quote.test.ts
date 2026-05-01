import { describe, expect, it } from "vitest"

import { parseSe4Blocks } from "../parser-test-utils.js"

describe("NaverSe4QuoteBlock", () => {
  it("parses quotation components into quote blocks", () => {
    const parsed = parseSe4Blocks(`
      <div class="se-component se-quotation">
        <blockquote class="se-quotation-container"><p>Quoted <strong>text</strong></p></blockquote>
      </div>
    `)

    expect(parsed.blocks).toEqual([{ type: "quote", text: "Quoted **text**" }])
  })

  it("throws when a quotation has no markdown content", () => {
    expect(() =>
      parseSe4Blocks(`
        <div class="se-component se-quotation">
          <blockquote class="se-quotation-container"><br /></blockquote>
        </div>
      `),
    ).toThrow("SE4 quote block parsing failed.")
  })
})
