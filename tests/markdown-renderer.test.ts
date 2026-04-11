import { describe, expect, it } from "vitest"

import { renderMarkdownPost } from "../src/modules/converter/markdown-renderer.js"
import { defaultExportOptions } from "../src/shared/export-options.js"
import type {
  AssetRecord,
  CategoryInfo,
  ParsedPost,
  PostSummary,
} from "../src/shared/types.js"

const category: CategoryInfo = {
  id: 84,
  name: "PS 알고리즘, 팁",
  parentId: 79,
  postCount: 49,
  isDivider: false,
  isOpen: true,
  path: ["Algorithm", "PS 알고리즘, 팁"],
  depth: 1,
}

const post: PostSummary = {
  blogId: "mym0404",
  logNo: "223034929697",
  title: "테스트 글",
  publishedAt: "2023-03-04T13:00:00+09:00",
  categoryId: 84,
  categoryName: "PS 알고리즘, 팁",
  source: "https://blog.naver.com/mym0404/223034929697",
  editorVersion: 4,
  thumbnailUrl: "https://example.com/thumb.png",
}

const parsedPost: ParsedPost = {
  editorVersion: 4,
  tags: ["algo"],
  warnings: [],
  videos: [
    {
      title: "Demo",
      thumbnailUrl: "https://example.com/video-thumb.png",
      sourceUrl: "https://blog.naver.com/mym0404/223034929697",
      vid: "vid",
      inkey: "inkey",
      width: 640,
      height: 360,
    },
  ],
  blocks: [
    { type: "heading", level: 2, text: "섹션" },
    { type: "paragraph", text: "본문입니다." },
    { type: "formula", formula: "f(n)=n+1", display: true },
    { type: "code", language: "ts", code: "const a = 1" },
    {
      type: "imageGroup",
      images: [
        {
          sourceUrl: "https://example.com/image-1.png",
          alt: "one",
          caption: null,
        },
        {
          sourceUrl: "https://example.com/image-2.png",
          alt: "two",
          caption: "caption",
        },
      ],
    },
    {
      type: "table",
      complex: false,
      html: "<table><tr><td>a</td></tr></table>",
      rows: [
        [
          {
            text: "col",
            html: "col",
            colspan: 1,
            rowspan: 1,
            isHeader: true,
          },
        ],
        [
          {
            text: "value",
            html: "value",
            colspan: 1,
            rowspan: 1,
            isHeader: false,
          },
        ],
      ],
    },
    {
      type: "linkCard",
      card: {
        title: "External article",
        description: "preview text",
        url: "https://example.com/article",
        imageUrl: "https://example.com/cover.png",
      },
    },
    {
      type: "video",
      video: parsedPostVideo(),
    },
  ],
}

function parsedPostVideo() {
  return {
    title: "Demo",
    thumbnailUrl: "https://example.com/video-thumb.png",
    sourceUrl: "https://blog.naver.com/mym0404/223034929697",
    vid: "vid",
    inkey: "inkey",
    width: 640,
    height: 360,
  }
}

describe("renderMarkdownPost", () => {
  it("renders frontmatter and markdown blocks with asset paths", async () => {
    const resolveAsset = async ({
      kind,
      sourceUrl,
    }: {
      kind: "image" | "thumbnail"
      postLogNo: string
      sourceUrl: string
      markdownFilePath: string
    }) =>
      ({
        kind,
        sourceUrl,
        relativePath: `../../assets/223034929697/${kind}-${sourceUrl.includes("video") ? "02" : "01"}.png`,
      }) satisfies AssetRecord

    const rendered = await renderMarkdownPost({
      post,
      category,
      parsedPost,
      markdownFilePath: "/tmp/output/posts/Algorithm/test.md",
      reviewedWarnings: [],
      options: defaultExportOptions(),
      resolveAsset,
    })

    expect(rendered.markdown).toContain("title: 테스트 글")
    expect(rendered.markdown).toContain("category: PS 알고리즘, 팁")
    expect(rendered.markdown).toContain("## 섹션")
    expect(rendered.markdown).toContain("$$\nf(n)=n+1\n$$")
    expect(rendered.markdown).toContain("```ts")
    expect(rendered.markdown).toContain("![one](../../assets/223034929697/image-01.png)")
    expect(rendered.markdown).toContain("| col |")
    expect(rendered.markdown).toContain("[External article](https://example.com/article)")
    expect(rendered.markdown).toContain("preview text")
    expect(rendered.markdown).toContain("**Video:** Demo")
    expect(rendered.assetRecords).toHaveLength(3)
  })

  it("applies detailed export options to markdown output", async () => {
    const options = defaultExportOptions()

    options.frontmatter.enabled = false
    options.markdown.formulaStyle = "math-fence"
    options.markdown.linkStyle = "referenced"
    options.markdown.imageStyle = "source-only"
    options.markdown.rawHtmlPolicy = "omit"

    const rendered = await renderMarkdownPost({
      post,
      category,
      parsedPost: {
        ...parsedPost,
        blocks: [
          ...parsedPost.blocks,
          {
            type: "rawHtml",
            html: "<div>raw</div>",
            reason: "fallback",
          },
        ],
      },
      markdownFilePath: "/tmp/output/posts/Algorithm/test.md",
      reviewedWarnings: [],
      options,
      resolveAsset: async ({
        kind,
        sourceUrl,
      }) =>
        ({
          kind,
          sourceUrl,
          relativePath: `../../assets/223034929697/${kind}-01.png`,
        }) satisfies AssetRecord,
    })

    expect(rendered.markdown.startsWith("---")).toBe(false)
    expect(rendered.markdown).toContain("```math\nf(n)=n+1\n```")
    expect(rendered.markdown).toMatch(/\[External article\]\[ref-\d+\]/)
    expect(rendered.markdown).not.toContain("<div>raw</div>")
  })

  it("drops degenerate emphasis-only paragraphs and malformed link-card descriptions", async () => {
    const rendered = await renderMarkdownPost({
      post,
      category,
      parsedPost: {
        ...parsedPost,
        blocks: [
          { type: "paragraph", text: "****" },
          {
            type: "linkCard",
            card: {
              title: "[1보] 속보",
              description: "(",
              url: "https://example.com/breaking",
              imageUrl: null,
            },
          },
        ],
      },
      markdownFilePath: "/tmp/output/posts/Algorithm/test.md",
      reviewedWarnings: [],
      options: defaultExportOptions(),
      resolveAsset: async ({
        kind,
        sourceUrl,
      }) =>
        ({
          kind,
          sourceUrl,
          relativePath: `../../assets/223034929697/${kind}-01.png`,
        }) satisfies AssetRecord,
    })

    expect(rendered.markdown).not.toContain("\n****\n")
    expect(rendered.markdown).not.toContain("\n(\n")
    expect(rendered.markdown).toContain("[1보] 속보")
  })
})
