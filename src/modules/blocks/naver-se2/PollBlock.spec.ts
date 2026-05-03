import { describe, expect, it } from "vitest"

import { parseSe2Blocks } from "../../../../tests/helpers/parser-test-utils.js"

describe("NaverSe2PollBlock", () => {
  it("parses poll iframes into link paragraphs", () => {
    const parsed = parseSe2Blocks(`
      <p align="center">
        <iframe
          class="poll_iframe"
          src="https://m.blog.naver.com/Poll.naver?pollKey=abc&amp;blogId=anglekim3708"
          title="포스트에 첨부된 투표"
        ></iframe>
      </p>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "paragraph",
        text: "[포스트에 첨부된 투표](https://m.blog.naver.com/Poll.naver?pollKey=abc&blogId=anglekim3708)",
      },
    ])
  })

  it("uses a fallback title for untitled poll iframe paragraphs", () => {
    const parsed = parseSe2Blocks(`
      <p>
        <iframe class="poll_iframe" src="https://m.blog.naver.com/Poll.naver?pollKey=abc"></iframe>
      </p>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "paragraph",
        text: "[투표](https://m.blog.naver.com/Poll.naver?pollKey=abc)",
      },
    ])
  })

  it("does not parse poll iframes mixed with text", () => {
    const parsed = parseSe2Blocks(`
      <p>
        caption
        <iframe class="poll_iframe" src="https://m.blog.naver.com/Poll.naver?pollKey=abc"></iframe>
      </p>
    `)

    expect(parsed.blocks).toEqual([{ type: "paragraph", text: "caption" }])
  })

  it("does not parse poll iframes mixed with other media", () => {
    const parsed = parseSe2Blocks(`
        <p>
          <iframe class="poll_iframe" src="https://m.blog.naver.com/Poll.naver?pollKey=abc"></iframe>
          <img src="https://example.com/other.png" alt="" />
        </p>
    `)

    expect(parsed.blocks).toMatchObject([
      {
        type: "image",
        image: {
          sourceUrl: "https://example.com/other.png",
          originalSourceUrl: null,
          alt: "",
          caption: null,
          mediaKind: "image",
        },
      },
    ])
  })

  it("does not parse poll iframes without a source", () => {
    expect(() =>
      parseSe2Blocks(`
        <p>
          <iframe class="poll_iframe"></iframe>
        </p>
      `),
    ).toThrow("파싱 가능한 naver-se2 block이 없습니다: p")
  })
})
