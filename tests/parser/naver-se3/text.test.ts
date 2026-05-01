import { describe, expect, it } from "vitest"

import {
  expectEveryBlockOutputOption,
  parseSe3Blocks,
  parseSe3BlocksWithOptions,
} from "../parser-test-utils.js"

describe("NaverSe3TextBlock", () => {
  it("parses text components into paragraph blocks", () => {
    const parsed = parseSe3Blocks(`
      <div class="se_component se_text">
        <div class="se_textarea">Alpha <strong>beta</strong></div>
        <div class="se_textarea">Gamma</div>
      </div>
    `)

    expect(parsed.blocks).toEqual([
      { type: "paragraph", text: "Alpha **beta**" },
      { type: "paragraph", text: "Gamma" },
    ])
    expect(parsed.tags).toEqual(["daily", "legacy"])
  })

  it("preserves hard breaks inside text components", () => {
    const parsed = parseSe3Blocks(`
      <div class="se_component se_text">
        <div class="se_textarea">첫 줄<br>둘째 줄</div>
      </div>
    `)

    expect(parsed.blocks).toEqual([{ type: "paragraph", text: "첫 줄  \n둘째 줄" }])
  })

  it("throws when a text component has no text blocks", () => {
    expect(() =>
      parseSe3Blocks(`
        <div class="se_component se_text">
          <div class="se_textarea"><br /></div>
        </div>
      `),
    ).toThrow("SE3 text block parsing failed.")
  })

  it("throws when a text area has no html", () => {
    expect(() =>
      parseSe3Blocks(`
        <div class="se_component se_text">
          <div class="se_textarea"></div>
        </div>
      `),
    ).toThrow("SE3 text block parsing failed.")
  })

  it("applies every output option", () => {
    expectEveryBlockOutputOption({
      editorType: "naver-se3",
      blockId: "paragraph",
      parse: (blockOutputs) =>
        parseSe3BlocksWithOptions({
          blockOutputs,
          components: [
            `
              <div class="se_component se_text">
                <div class="se_textarea">Alpha <a href="https://example.com">link</a></div>
              </div>
            `,
          ],
        }),
    })
  })
})
