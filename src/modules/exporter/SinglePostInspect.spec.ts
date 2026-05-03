import { describe, expect, it } from "vitest"

import { defaultExportOptions } from "../../shared/ExportOptions.js"
import { inspectPostHtml } from "./SinglePostInspect.js"

const options = defaultExportOptions()
const sourceUrl = "https://blog.naver.com/my-blog/123456789012"

describe("single post inspect", () => {
  it("reports successful parse block types", () => {
    const diagnostics = inspectPostHtml({
      blogId: "my-blog",
      logNo: "123456789012",
      sourceUrl,
      options,
      html: `
        <div id="viewTypeSelector">
          <div class="se-component se-text">
            <script class="__se_module_data" data-module-v2='{"type":"v2_text"}'></script>
            <p class="se-text-paragraph">Hello</p>
          </div>
        </div>
      `,
    })

    expect(diagnostics.editor).toEqual({
      type: "naver-se4",
      label: "SmartEditor 4",
    })
    expect(diagnostics.parse).toEqual({
      status: "success",
      blockTypes: ["paragraph"],
    })
    expect(diagnostics.unsupportedNodes).toEqual([])
  })

  it("includes SE4 module data for unsupported nodes", () => {
    const diagnostics = inspectPostHtml({
      blogId: "my-blog",
      logNo: "123456789012",
      sourceUrl,
      options,
      html: `
        <div id="viewTypeSelector">
          <div class="se-component se-file se-l-default" id="SE-file">
            <script class="__se_module_data" data-module-v2='{"type":"v2_file","data":{"link":"https://example.com/file.pdf"}}'></script>
            <a class="se-file-save-button" href="https://example.com/file.pdf">파일 다운로드</a>
          </div>
        </div>
      `,
    })

    expect(diagnostics.parse).toMatchObject({
      status: "failed",
      error: '파싱 가능한 naver-se4 block이 없습니다: div class="se-component se-file se-l-default" moduleType="v2_file"',
    })
    expect(diagnostics.unsupportedNodes).toHaveLength(1)
    expect(diagnostics.unsupportedNodes[0]).toMatchObject({
      path: "0",
      tagName: "div",
      id: "SE-file",
      className: "se-component se-file se-l-default",
      moduleType: "v2_file",
      moduleData: {
        type: "v2_file",
        data: {
          link: "https://example.com/file.pdf",
        },
      },
    })
  })

  it("reports unsupported SE2 wrapper children", () => {
    const diagnostics = inspectPostHtml({
      blogId: "my-blog",
      logNo: "123456789012",
      sourceUrl,
      options,
      html: `<div id="viewTypeSelector"><div><p>Intro</p><div><video class="fx _postImage _gifmp4" data-gif-url="https://example.com/sample.gif"></video></div></div></div>`,
    })

    expect(diagnostics.parse).toMatchObject({
      status: "failed",
      error: "파싱 가능한 naver-se2 block이 없습니다: div",
    })
    expect(diagnostics.unsupportedNodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "0.1",
          tagName: "div",
          unsupported: true,
          children: [
            expect.objectContaining({
              path: "0.1.0",
              tagName: "video",
              unsupported: true,
            }),
          ],
        }),
      ]),
    )
  })
})
