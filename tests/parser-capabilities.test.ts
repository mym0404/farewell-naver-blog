import { describe, expect, it } from "vitest"

import {
  getParserCapabilityLookupIds,
  getParserCapabilityId,
  getUnsupportedBlockCaseCapabilityLookupId,
  parserCapabilities,
} from "../src/shared/parser-capabilities.js"
import {
  getConfirmedUnsupportedBlockCaseCandidateDefinition,
  getUnsupportedBlockCaseDefinition,
  unsupportedBlockCaseIds,
} from "../src/shared/unsupported-block-cases.js"

describe("parserCapabilities", () => {
  it("declares block-unit resolution rules for every unsupported representative case", () => {
    const rules = parserCapabilities.flatMap(
      (capability) => capability.unsupportedBlockCaseResolutions ?? [],
    )

    expect(rules).toHaveLength(unsupportedBlockCaseIds.length)
    expect(rules.map((rule) => rule.caseId).sort()).toEqual(
      [...unsupportedBlockCaseIds].sort(),
    )
    expect(rules.every((rule) => rule.processingScope === "block-unit")).toBe(true)
    rules.forEach((rule) => {
      const confirmedCandidate = getConfirmedUnsupportedBlockCaseCandidateDefinition(rule.caseId)

      expect(rule.confirmedCandidateId).toBe(confirmedCandidate?.id)
      expect(rule.resolution).toEqual(confirmedCandidate?.resolution)
    })
  })

  it("attaches confirmed candidate rules to the source capability that currently owns the fallback", () => {
    const se2RawHtmlCapability = parserCapabilities.find(
      (capability) =>
        capability.id === getParserCapabilityId({ editorVersion: 2, blockType: "rawHtml" }),
    )
    const se3ParagraphCapability = parserCapabilities.find(
      (capability) =>
        capability.id === getParserCapabilityId({ editorVersion: 3, blockType: "paragraph" }),
    )

    expect(se2RawHtmlCapability?.unsupportedBlockCaseResolutions).toMatchObject([
      {
        caseId: "se2-inline-gif-video",
        confirmedCandidateId: "linked-poster-image",
        resolution: {
          ast: {
            blockTypes: ["image"],
          },
          render: {
            surface: "markdown",
            blockType: "image",
            selection: {
              variant: "linked-image",
            },
          },
        },
        processingScope: "block-unit",
      },
    ])
    expect(se2RawHtmlCapability?.verificationMode).toBe("parser-fixture")
    expect(se2RawHtmlCapability?.sampleIds).toEqual([])
    expect(se3ParagraphCapability?.unsupportedBlockCaseResolutions).toMatchObject([
      {
        caseId: "se3-horizontal-line-default",
        confirmedCandidateId: "markdown-hr",
        resolution: {
          ast: {
            blockTypes: ["divider"],
          },
          render: {
            surface: "markdown",
            blockType: "divider",
            selection: {
              variant: "dash-rule",
            },
          },
        },
        processingScope: "block-unit",
      },
      {
        caseId: "se3-horizontal-line-line5",
        confirmedCandidateId: "html-line5-hr",
        resolution: {
          ast: {
            blockTypes: ["htmlFragment"],
          },
          render: {
            surface: "html",
            blockType: "htmlFragment",
            htmlTag: "hr",
          },
        },
        processingScope: "block-unit",
      },
      {
        caseId: "se3-oglink-og_bSize",
        confirmedCandidateId: "rich-html-card",
        resolution: {
          ast: {
            blockTypes: ["htmlFragment"],
          },
          render: {
            surface: "html",
            blockType: "htmlFragment",
            htmlTag: "a",
          },
        },
        processingScope: "block-unit",
      },
    ])
  })

  it("replaces rawHtml-only fallback observations with case lookup ids", () => {
    const lookupIds = getParserCapabilityLookupIds({
      editorVersion: 2,
      blocks: [
        {
          type: "rawHtml",
          html: '<p><video class="fx _postImage _gifmp4"></video></p>',
          reason: "se2:p",
        },
      ],
      warnings: [],
      unsupportedBlocks: [
        {
          caseId: "se2-inline-gif-video",
          blockIndex: 0,
          warningText: getUnsupportedBlockCaseDefinition("se2-inline-gif-video")!.warningText,
          data: {
            sourceUrl: "https://example.com/sample.mp4",
            posterUrl: "https://example.com/sample.gif",
          },
        },
      ],
    })

    expect(lookupIds).toEqual([
      getUnsupportedBlockCaseCapabilityLookupId("se2-inline-gif-video"),
    ])
  })

  it("keeps native paragraph capability alongside resolved case lookup ids", () => {
    const lookupIds = getParserCapabilityLookupIds({
      editorVersion: 3,
      blocks: [
        { type: "paragraph", text: "intro" },
        { type: "paragraph", text: "---" },
        { type: "paragraph", text: "line5" },
      ],
      warnings: [],
      unsupportedBlocks: [
        {
          caseId: "se3-horizontal-line-default",
          blockIndex: 1,
          warningText: getUnsupportedBlockCaseDefinition("se3-horizontal-line-default")!.warningText,
          data: {
            blockKind: "horizontalLine",
            styleToken: "default",
          },
        },
        {
          caseId: "se3-horizontal-line-line5",
          blockIndex: 2,
          warningText: getUnsupportedBlockCaseDefinition("se3-horizontal-line-line5")!.warningText,
          data: {
            blockKind: "horizontalLine",
            styleToken: "line5",
          },
        },
      ],
    })

    expect(lookupIds).toEqual([
      getParserCapabilityId({ editorVersion: 3, blockType: "paragraph" }),
      getUnsupportedBlockCaseCapabilityLookupId("se3-horizontal-line-default"),
      getUnsupportedBlockCaseCapabilityLookupId("se3-horizontal-line-line5"),
    ])
  })

  it("does not count resolved case output blocks as native capabilities", () => {
    const lookupIds = getParserCapabilityLookupIds({
      editorVersion: 3,
      blocks: [
        { type: "paragraph", text: "intro" },
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
          text: "[비타는 삶이다](https://blog.naver.com/is02019/221072284462)",
        },
        {
          type: "paragraph",
          text: "PS Vita 리뷰",
        },
        {
          type: "paragraph",
          text: "blog.naver.com",
        },
      ],
      warnings: [],
      unsupportedBlocks: [
        {
          caseId: "se3-oglink-og_bSize",
          blockIndex: 1,
          blockCount: 4,
          warningText: getUnsupportedBlockCaseDefinition("se3-oglink-og_bSize")!.warningText,
          data: {
            url: "https://blog.naver.com/is02019/221072284462",
            title: "비타는 삶이다",
            description: "PS Vita 리뷰",
            publisher: "blog.naver.com",
            imageUrl: "https://example.com/card.png",
            sizeToken: "og_bSize",
          },
        },
      ],
    })

    expect(lookupIds).toEqual([
      getParserCapabilityId({ editorVersion: 3, blockType: "paragraph" }),
      getUnsupportedBlockCaseCapabilityLookupId("se3-oglink-og_bSize"),
    ])
  })

  it("falls back to warning text lookup when structured unsupported blocks are absent", () => {
    const lookupIds = getParserCapabilityLookupIds({
      editorVersion: 3,
      blocks: [{ type: "paragraph", text: "fallback" }],
      warnings: [getUnsupportedBlockCaseDefinition("se3-oglink-og_bSize")!.warningText],
    })

    expect(lookupIds).toEqual([
      getParserCapabilityId({ editorVersion: 3, blockType: "paragraph" }),
      getUnsupportedBlockCaseCapabilityLookupId("se3-oglink-og_bSize"),
    ])
  })
})
