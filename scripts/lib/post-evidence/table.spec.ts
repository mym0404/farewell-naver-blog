import { describe, expect, it } from "vitest"

import { renderEvidenceMarkdownTable } from "./table.js"

describe("renderEvidenceMarkdownTable", () => {
  it("escapes table-breaking characters in metadata and markdown", () => {
    const table = renderEvidenceMarkdownTable([
      {
        metadata: {
          title: "a | b",
          note: "line 1\n<p>",
        },
        sourceUrl: "https://blog.naver.com/a/1",
        rendererUrl: "https://markdownviewer.pages.dev/#share=test",
        rendererError: null,
        naverCapturePath: "assets/naver.png",
        markdown: "left | right\n<script>",
        renderedCapturePath: "assets/rendered.png",
      },
    ])

    expect(table).toContain("a &#124; b")
    expect(table).toContain("line 1<br>&lt;p&gt;")
    expect(table).toContain("left &#124; right<br>&lt;script&gt;")
    expect(table.split("\n")[2]?.split("|")).toHaveLength(7)
  })

  it("renders renderer link failures in the links column", () => {
    const table = renderEvidenceMarkdownTable([
      {
        metadata: "case",
        sourceUrl: "https://blog.naver.com/a/1",
        rendererUrl: null,
        rendererError: "too long",
        naverCapturePath: null,
        markdown: null,
        renderedCapturePath: null,
      },
    ])

    expect(table).toContain("실패: too long")
  })
})
