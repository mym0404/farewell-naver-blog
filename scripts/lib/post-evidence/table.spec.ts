import { describe, expect, it } from "vitest"

import { renderEvidenceMarkdownTable } from "./table.js"

describe("renderEvidenceMarkdownTable", () => {
  it("renders a GitHub-safe HTML table and preserves Markdown line breaks", () => {
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

    expect(table).toContain("<th>Metadata</th>")
    expect(table).toContain("<th>Markdown</th>")
    expect(table).toContain("a | b")
    expect(table).toContain("line 1\n&lt;p&gt;")
    expect(table).toContain("left | right\n&lt;script&gt;")
    expect(table).toContain('<a href="https://blog.naver.com/a/1">Naver</a>')
    expect(table).toContain('<img src="assets/naver.png" alt="Naver Capture" width="260">')
    expect(table).not.toContain("<br>")
  })
})
