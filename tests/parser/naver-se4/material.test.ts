import { describe, expect, it } from "vitest"

import { expectEveryBlockOutputOption, parseSe4Blocks, parseSe4BlocksWithOptions } from "../parser-test-utils.js"

describe("NaverSe4MaterialBlock", () => {
  it("parses material components into link cards", () => {
    const parsed = parseSe4Blocks(`
      <div class="se-component se-material">
        <a
          class="se-module-material"
          href="https://example.com/material"
          data-linkdata='{"thumbnail":"https://example.com/material.png","title":"Fallback title"}'
        >
          <strong class="se-material-title">Reference card</strong>
          <img class="se-material-thumbnail-resource" src="https://example.com/material.png" />
          <div class="se-material-detail">
            <div class="se-material-detail-title">Author</div>
            <div class="se-material-detail-description">mj</div>
            <div class="se-material-detail-title">Type</div>
            <div class="se-material-detail-description">note</div>
          </div>
        </a>
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "linkCard",
        card: {
          title: "Reference card",
          description: "Author: mj / Type: note",
          url: "https://example.com/material",
          imageUrl: "https://example.com/material.png",
        },
      },
    ])
  })

  it("throws when a material component has no url", () => {
    expect(() =>
      parseSe4Blocks(`
        <div class="se-component se-material">
          <a class="se-module-material"></a>
        </div>
      `),
    ).toThrow("SE4 material block parsing failed.")
  })

  it("uses link data fallbacks and skips empty material details", () => {
    const parsed = parseSe4Blocks(`
      <div class="se-component se-material">
        <a
          class="se-module-material"
          data-linkdata='{"link":"https://example.com/from-data","thumbnail":"https://example.com/data.png","title":"Data title"}'
        >
          <div class="se-material-detail">
            <span>ignored</span>
            <div class="se-material-detail-description"></div>
            <div class="se-material-detail-description">loose detail</div>
          </div>
        </a>
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "linkCard",
        card: {
          title: "Data title",
          description: "loose detail",
          url: "https://example.com/from-data",
          imageUrl: "https://example.com/data.png",
        },
      },
    ])
  })

  it("falls back to url when material title data is empty", () => {
    const parsed = parseSe4Blocks(`
      <div class="se-component se-material">
        <a class="se-module-material" href="https://example.com/no-title"></a>
      </div>
    `)

    expect(parsed.blocks[0]).toMatchObject({
      type: "linkCard",
      card: {
        title: "https://example.com/no-title",
        imageUrl: null,
      },
    })
  })

  it("applies every output option", () => {
    expectEveryBlockOutputOption({
      editorType: "naver-se4",
      blockId: "linkCard",
      parse: (blockOutputs) =>
        parseSe4BlocksWithOptions({
          blockOutputs,
          components: [
            `
              <div class="se-component se-material">
                <a class="se-module-material" href="https://example.com/material">
                  <strong class="se-material-title">Reference card</strong>
                </a>
              </div>
            `,
          ],
        }),
    })
  })
})
