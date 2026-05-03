import { describe, expect, it } from "vitest"

import { renderEvidenceMarkdownSections } from "./evidence.js"

describe("renderEvidenceMarkdownSections", () => {
  it("renders README-style sections with fenced Markdown snippets", () => {
    const evidence = renderEvidenceMarkdownSections([
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

    expect(evidence).toContain("### title: a | b / note: line 1 / <p>")
    expect(evidence).toContain("[원문 보기](https://blog.naver.com/a/1)")
    expect(evidence).toContain('<img src="assets/naver.png" alt="title: a | b / note: line 1 / &lt;p&gt; Naver capture" width="300">')
    expect(evidence).toContain("```markdown\nleft | right\n<script>\n```")
    expect(evidence).not.toContain("| Metadata |")
    expect(evidence).not.toContain("<table>")
  })
})
