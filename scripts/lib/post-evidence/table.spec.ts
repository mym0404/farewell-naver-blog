import { describe, expect, it } from "vitest"

import { renderEvidenceMarkdownTable } from "./table.js"

describe("renderEvidenceMarkdownTable", () => {
  it("renders a GitHub-safe Markdown table with single-line Markdown snippets", () => {
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

    expect(table).toContain("| Metadata | Links | Naver Capture | Markdown |")
    expect(table).toContain("a \\| b")
    expect(table).toContain("line 1 / <p>")
    expect(table).toContain("` left \\| right\\n<script> `")
    expect(table).toContain("[Naver](https://blog.naver.com/a/1)")
    expect(table).toContain('<img src="assets/naver.png" alt="Naver Capture" width="300">')
    expect(table).not.toContain("<table>")
    expect(table).not.toContain("<br>")
    expect(table.split("\n")[2]?.startsWith("| ")).toBe(true)
  })
})
