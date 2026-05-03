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
        naverCapturePath: "assets/naver.png",
        markdown: "left | right\n<script>",
      },
    ])

    expect(table).toContain("a &#124; b")
    expect(table).toContain("line 1<br>&lt;p&gt;")
    expect(table).toContain("left &#124; right<br>&lt;script&gt;")
    expect(table).toContain("[Naver](https://blog.naver.com/a/1)")
    expect(table.split("\n")[2]?.split("|")).toHaveLength(6)
  })
})
