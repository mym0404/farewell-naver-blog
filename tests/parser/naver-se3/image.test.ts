import { describe, expect, it } from "vitest"

import {
  expectEveryBlockOutputOption,
  parseSe3Blocks,
  parseSe3BlocksWithOptions,
} from "../parser-test-utils.js"

describe("NaverSe3ImageBlock", () => {
  it("parses standalone image components into image blocks", () => {
    const parsed = parseSe3Blocks(`
      <div class="se_component se_image">
        <img src="https://example.com/se3-image.png" alt="se3 image" />
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "image",
        image: {
          sourceUrl: "https://example.com/se3-image.png",
          originalSourceUrl: null,
          alt: "se3 image",
          caption: null,
          mediaKind: "image",
        },
        outputSelectionKey: "naver-se3:image",
        outputSelection: {
          variant: "markdown-image",
        },
      },
    ])
  })

  it("parses multiple standalone images into imageGroup blocks", () => {
    const parsed = parseSe3Blocks(`
      <div class="se_component se_image">
        <img src="https://example.com/one.png" alt="one" />
        <img src="https://example.com/two.png" alt="two" />
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "imageGroup",
        images: [
          {
            sourceUrl: "https://example.com/one.png",
            originalSourceUrl: null,
            alt: "one",
            caption: null,
            mediaKind: "image",
          },
          {
            sourceUrl: "https://example.com/two.png",
            originalSourceUrl: null,
            alt: "two",
            caption: null,
            mediaKind: "image",
          },
        ],
      },
    ])
  })

  it("skips image candidates without a source", () => {
    const parsed = parseSe3Blocks(`
      <div class="se_component se_image">
        <img alt="missing" />
        <img data-lazy-src="https://example.com/lazy.png" alt="lazy" />
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "image",
        image: {
          sourceUrl: "https://example.com/lazy.png",
          originalSourceUrl: null,
          alt: "lazy",
          caption: null,
          mediaKind: "image",
        },
        outputSelectionKey: "naver-se3:image",
        outputSelection: {
          variant: "markdown-image",
        },
      },
    ])
  })

  it("applies every output option", () => {
    expectEveryBlockOutputOption({
      editorType: "naver-se3",
      blockId: "image",
      parse: (blockOutputs) =>
        parseSe3BlocksWithOptions({
          blockOutputs,
          components: [
            `
              <div class="se_component se_image">
                <img src="https://example.com/se3-image.png" alt="se3 image" />
              </div>
            `,
          ],
        }),
    })
  })
})
