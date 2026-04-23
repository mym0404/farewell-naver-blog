import { describe, expect, it } from "vitest"

import { normalizeUnsupportedBlocks } from "../src/modules/converter/unsupported-block-normalizer.js"
import { defaultExportOptions } from "../src/shared/export-options.js"
import { getUnsupportedBlockCaseDefinition } from "../src/shared/unsupported-block-cases.js"
import type { ParsedPost } from "../src/shared/types.js"

const createParsedPost = (overrides?: Partial<ParsedPost>): ParsedPost => ({
  editorVersion: 3,
  tags: [],
  warnings: [],
  blocks: [],
  unsupportedBlocks: [],
  videos: [],
  ...overrides,
})

describe("normalizeUnsupportedBlocks", () => {
  it("replaces SE3 horizontal line fallback paragraphs with html fragments and clears case warnings", () => {
    const warningText = getUnsupportedBlockCaseDefinition("se3-horizontal-line-line5")!.warningText
    const normalized = normalizeUnsupportedBlocks({
      parsedPost: createParsedPost({
        blocks: [{ type: "paragraph", text: "---" }],
        warnings: [warningText],
        unsupportedBlocks: [
          {
            caseId: "se3-horizontal-line-line5",
            blockIndex: 0,
            warningText,
            data: {
              blockKind: "horizontalLine",
              styleToken: "line5",
            },
          },
        ],
      }),
      options: defaultExportOptions(),
    })

    expect(normalized.blocks).toEqual([
      {
        type: "htmlFragment",
        html: '<hr data-naver-block="se3-horizontal-line" data-style="line5">',
      },
    ])
    expect(normalized.warnings).toEqual([])
    expect(normalized.unsupportedBlocks).toEqual([])
  })

  it("expands oglink markdown summary candidate into supported image and paragraph blocks", () => {
    const warningText = getUnsupportedBlockCaseDefinition("se3-oglink-og_bSize")!.warningText
    const options = defaultExportOptions()

    options.unsupportedBlockCases["se3-oglink-og_bSize"] = {
      candidateId: "markdown-image-summary",
      confirmed: true,
    }

    const normalized = normalizeUnsupportedBlocks({
      parsedPost: createParsedPost({
        blocks: [
          {
            type: "paragraph",
            text: "fallback",
          },
        ],
        warnings: [warningText],
        unsupportedBlocks: [
          {
            caseId: "se3-oglink-og_bSize",
            blockIndex: 0,
            warningText,
            data: {
              url: "https://blog.naver.com/is02019/221072284462",
              title: "[Review PS Vita Part1] 비타는 삶이다 - 소니 PS Vita",
              description: "PS Vita 리뷰",
              publisher: "blog.naver.com",
              imageUrl: "https://example.com/card.png",
              sizeToken: "og_bSize",
            },
          },
        ],
      }),
      options,
    })

    expect(normalized.blocks).toEqual([
      {
        type: "image",
        image: {
          sourceUrl: "https://example.com/card.png",
          originalSourceUrl: "https://blog.naver.com/is02019/221072284462",
          alt: "",
          caption: null,
          mediaKind: "image",
        },
        outputSelection: {
          variant: "linked-image",
        },
      },
      {
        type: "paragraph",
        text: "[\\[Review PS Vita Part1\\] 비타는 삶이다 - 소니 PS Vita](https://blog.naver.com/is02019/221072284462)",
      },
      {
        type: "paragraph",
        text: "PS Vita 리뷰",
      },
      {
        type: "paragraph",
        text: "blog.naver.com",
      },
    ])
    expect(normalized.warnings).toEqual([])
    expect(normalized.unsupportedBlocks).toEqual([])
  })

  it("turns the GIF fallback into a video block when the source-link candidate is selected", () => {
    const warningText = getUnsupportedBlockCaseDefinition("se2-inline-gif-video")!.warningText
    const options = defaultExportOptions()

    options.unsupportedBlockCases["se2-inline-gif-video"] = {
      candidateId: "source-link-only",
      confirmed: true,
    }

    const normalized = normalizeUnsupportedBlocks({
      parsedPost: createParsedPost({
        editorVersion: 2,
        blocks: [
          {
            type: "rawHtml",
            html: '<p><video class="fx _postImage _gifmp4"></video></p>',
            reason: "se2:p",
          },
        ],
        warnings: [warningText],
        unsupportedBlocks: [
          {
            caseId: "se2-inline-gif-video",
            blockIndex: 0,
            warningText,
            data: {
              sourceUrl: "https://example.com/123.mp4",
              posterUrl: "https://example.com/123.gif",
            },
          },
        ],
      }),
      options,
    })

    expect(normalized.blocks).toEqual([
      {
        type: "video",
        video: {
          title: "GIF video",
          thumbnailUrl: "https://example.com/123.gif",
          sourceUrl: "https://example.com/123.mp4",
          vid: null,
          inkey: null,
          width: null,
          height: null,
        },
        outputSelection: {
          variant: "source-link",
        },
      },
    ])
    expect(normalized.videos).toEqual([
      {
        title: "GIF video",
        thumbnailUrl: "https://example.com/123.gif",
        sourceUrl: "https://example.com/123.mp4",
        vid: null,
        inkey: null,
        width: null,
        height: null,
      },
    ])
    expect(normalized.warnings).toEqual([])
    expect(normalized.unsupportedBlocks).toEqual([])
  })
})
