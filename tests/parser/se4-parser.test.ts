import { load } from "cheerio"
import { describe, expect, it } from "vitest"

import { parseSe4Post } from "../../src/modules/parser/se4-parser.js"
import { defaultExportOptions } from "../../src/shared/export-options.js"

const parserOptions = {
  markdown: defaultExportOptions().markdown,
}

const sourceUrl = "https://blog.naver.com/mym0404/123456789"

const createModuleScript = (module: Record<string, unknown>) =>
  `<script class="__se_module_data" data-module-v2='${JSON.stringify(module)}'></script>`

const createSe4Html = (...components: string[]) =>
  `<div id="viewTypeSelector">${components.join("")}</div>`

const parseSe4Fixture = (...components: string[]) =>
  parseSe4Post({
    $: load(createSe4Html(...components)),
    sourceUrl,
    tags: ["algo", "algo", "math"],
    options: parserOptions,
  })

describe("parseSe4Post", () => {
  it("parses text components into paragraph blocks", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-text">
        ${createModuleScript({ type: "v2_text" })}
        <p class="se-text-paragraph">First <strong>block</strong></p>
        <p class="se-text-paragraph">Second <a href="https://example.com">link</a></p>
      </div>
    `)

    expect(parsed.blocks).toEqual([
      { type: "paragraph", text: "First **block**" },
      { type: "paragraph", text: "Second [link](https://example.com)" },
    ])
    expect(parsed.tags).toEqual(["algo", "math"])
  })

  it("parses section title components into heading blocks", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-sectionTitle">
        <div class="se-module-text"><span>Section title</span></div>
      </div>
    `)

    expect(parsed.blocks).toEqual([{ type: "heading", level: 2, text: "Section title" }])
  })

  it("parses quotation components into quote blocks", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-quotation">
        <blockquote class="se-quotation-container"><p>Quoted <strong>text</strong></p></blockquote>
      </div>
    `)

    expect(parsed.blocks).toEqual([{ type: "quote", text: "Quoted **text**" }])
  })

  it("parses formula components into formula blocks", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-math">
        ${createModuleScript({ type: "v2_formula", data: { latex: "$x^2 + y^2 = z^2$" } })}
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "formula",
        formula: "x^2 + y^2 = z^2",
        display: true,
      },
    ])
  })

  it("parses code components with language metadata", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-code">
        ${createModuleScript({ type: "v2_code" })}
        <pre class="__se_code_view language-typescript">const value = 1
console.log(value)
</pre>
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "code",
        language: "typescript",
        code: "const value = 1\nconsole.log(value)",
      },
    ])
  })

  it("parses oglink components into link cards", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-oglink">
        <a class="se-oglink-info" href="https://example.com/article"></a>
        <strong class="se-oglink-title">External article</strong>
        <p class="se-oglink-summary">preview text</p>
        <a class="se-oglink-thumbnail" href="https://example.com/article">
          <img class="se-oglink-thumbnail-resource" src="https://example.com/cover.png" />
        </a>
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "linkCard",
        card: {
          title: "External article",
          description: "preview text",
          url: "https://example.com/article",
          imageUrl: "https://example.com/cover.png",
        },
      },
    ])
  })

  it("parses oembed components into link cards", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-oembed">
        ${createModuleScript({
          type: "v2_oembed",
          data: {
            title: "Video embed",
            description: "embedded preview",
            inputUrl: "https://youtu.be/demo",
            thumbnailUrl: "https://example.com/oembed.png",
          },
        })}
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "linkCard",
        card: {
          title: "Video embed",
          description: "embedded preview",
          url: "https://youtu.be/demo",
          imageUrl: "https://example.com/oembed.png",
        },
      },
    ])
  })

  it("parses video components and exposes collected videos", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-video">
        ${createModuleScript({
          type: "v2_video",
          data: {
            thumbnail: "https://example.com/video-thumb.png",
            vid: "vid-1",
            inkey: "inkey-1",
            width: "640",
            height: "360",
            mediaMeta: { title: "Demo video" },
          },
        })}
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "video",
        video: {
          title: "Demo video",
          thumbnailUrl: "https://example.com/video-thumb.png",
          sourceUrl,
          vid: "vid-1",
          inkey: "inkey-1",
          width: 640,
          height: 360,
        },
      },
    ])
    expect(parsed.videos).toEqual([
      {
        title: "Demo video",
        thumbnailUrl: "https://example.com/video-thumb.png",
        sourceUrl,
        vid: "vid-1",
        inkey: "inkey-1",
        width: 640,
        height: 360,
      },
    ])
  })

  it("parses simple table components into table blocks", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-table">
        ${createModuleScript({ type: "v2_table" })}
        <table>
          <tr><th>name</th><th>value</th></tr>
          <tr><td>a</td><td>1</td></tr>
        </table>
      </div>
    `)

    expect(parsed.blocks).toHaveLength(1)
    expect(parsed.blocks[0]).toMatchObject({
      type: "table",
      complex: false,
      rows: [
        [
          { text: "name", colspan: 1, rowspan: 1, isHeader: true },
          { text: "value", colspan: 1, rowspan: 1, isHeader: true },
        ],
        [
          { text: "a", colspan: 1, rowspan: 1, isHeader: false },
          { text: "1", colspan: 1, rowspan: 1, isHeader: false },
        ],
      ],
    })
  })

  it("falls back to raw html when a table component has no table element", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-table">
        ${createModuleScript({ type: "v2_table" })}
        <div class="se-table-placeholder"></div>
      </div>
    `)

    expect(parsed.blocks).toHaveLength(1)
    expect(parsed.blocks[0]).toMatchObject({
      type: "rawHtml",
      reason: "table-fallback",
    })
    expect(parsed.blocks[0]).toHaveProperty("html")
    expect(parsed.blocks[0]?.type === "rawHtml" ? parsed.blocks[0].html : "").toContain(
      '<div class="se-table-placeholder"></div>',
    )
    expect(parsed.warnings).toContain("표 블록을 표로 해석하지 못해 raw HTML fallback으로 남겼습니다.")
  })

  it("parses material components into link cards", () => {
    const parsed = parseSe4Fixture(`
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

  it("parses image components into image blocks with captions", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-image">
        <a class="se-module-image-link" data-linkdata='{"src":"https://example.com/image.png"}'>
          <img src="https://example.com/image.png" alt="diagram" />
        </a>
        <p class="se-image-caption">image caption</p>
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "image",
        image: {
          sourceUrl: "https://example.com/image.png",
          alt: "diagram",
          caption: "image caption",
        },
      },
    ])
  })

  it("parses image group components into imageGroup blocks", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-image-group">
        ${createModuleScript({ type: "v2_imageGroup" })}
        <a class="se-module-image-link" data-linkdata='{"src":"https://example.com/one.png"}'>
          <img src="https://example.com/one.png" alt="one" />
        </a>
        <a class="se-module-image-link" data-linkdata='{"src":"https://example.com/two.png"}'>
          <img src="https://example.com/two.png" alt="two" />
        </a>
        <p class="se-image-caption">shared caption</p>
      </div>
    `)

    expect(parsed.blocks).toEqual([
      {
        type: "imageGroup",
        images: [
          {
            sourceUrl: "https://example.com/one.png",
            alt: "one",
            caption: "shared caption",
          },
          {
            sourceUrl: "https://example.com/two.png",
            alt: "two",
            caption: "shared caption",
          },
        ],
      },
    ])
  })

  it("parses horizontal line components into divider blocks", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-horizontalLine"></div>
    `)

    expect(parsed.blocks).toEqual([{ type: "divider" }])
  })

  it("converts unsupported components to markdown paragraphs when possible", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-unsupported">
        <p>Unsupported <strong>content</strong></p>
      </div>
    `)

    expect(parsed.blocks).toEqual([{ type: "paragraph", text: "Unsupported **content**" }])
    expect(parsed.warnings).toContain(
      "지원하지 않는 SE4 블록을 텍스트로 변환했습니다: se-component se-unsupported",
    )
  })

  it("keeps unsupported empty components as raw html", () => {
    const parsed = parseSe4Fixture(`
      <div class="se-component se-empty">
        <div></div>
      </div>
    `)

    expect(parsed.blocks).toHaveLength(1)
    expect(parsed.blocks[0]).toMatchObject({
      type: "rawHtml",
      reason: "unsupported:se-component se-empty",
    })
    expect(parsed.blocks[0]).toHaveProperty("html")
    expect(parsed.blocks[0]?.type === "rawHtml" ? parsed.blocks[0].html : "").toContain("<div></div>")
    expect(parsed.warnings).toContain(
      "지원하지 않는 SE4 블록을 raw HTML로 보존했습니다: se-component se-empty",
    )
  })
})
