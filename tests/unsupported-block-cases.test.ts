import { describe, expect, it } from "vitest"

import {
  defaultUnsupportedBlockCaseSelections,
  getConfirmedUnsupportedBlockCaseCandidateDefinition,
  getUnsupportedBlockCaseCandidateDefinition,
  getUnsupportedBlockCaseDefinitionByWarningText,
  getUnsupportedBlockCaseIdByWarningText,
  renderUnsupportedBlockCaseCandidatePreview,
  unsupportedBlockCaseDefinitions,
} from "../src/shared/unsupported-block-cases.js"
import { defaultExportOptions } from "../src/shared/export-options.js"

describe("unsupported block case definitions", () => {
  it("pins every candidate to a non-empty AST resolution and a concrete render surface", () => {
    unsupportedBlockCaseDefinitions.forEach((definition) => {
      expect(definition.candidates.length).toBeGreaterThan(1)
      expect(getConfirmedUnsupportedBlockCaseCandidateDefinition(definition.id)?.id).toBe(
        definition.confirmedCandidateId,
      )

      definition.candidates.forEach((candidate) => {
        expect(candidate.resolution.ast.blockTypes.length).toBeGreaterThan(0)

        if (candidate.resolution.render.surface === "html") {
          expect(candidate.resolution.render.blockType).toBe("htmlFragment")
          expect(["a", "hr"]).toContain(candidate.resolution.render.htmlTag)
          return
        }

        if (candidate.resolution.render.blockType === "composite") {
          expect(candidate.resolution.ast.blockTypes).toEqual([
            "image",
            "paragraph",
            "paragraph",
            "paragraph",
          ])
          expect(candidate.resolution.render.sections).toEqual([
            "linked-thumbnail",
            "linked-title",
            "description",
            "publisher",
          ])
          return
        }

        expect(candidate.resolution.ast.blockTypes).toHaveLength(1)
      })
    })
  })

  it("keeps recommended selections aligned with the typed candidate definitions", () => {
    expect(defaultUnsupportedBlockCaseSelections["se2-inline-gif-video"]).toEqual({
      candidateId: "linked-poster-image",
      confirmed: false,
    })
    expect(defaultUnsupportedBlockCaseSelections["se3-horizontal-line-line5"]).toEqual({
      candidateId: "html-line5-hr",
      confirmed: false,
    })

    expect(
      getUnsupportedBlockCaseCandidateDefinition({
        caseId: "se3-oglink-og_bSize",
        candidateId: "markdown-image-summary",
      }),
    )?.toMatchObject({
      resolution: {
        ast: {
          blockTypes: ["image", "paragraph", "paragraph", "paragraph"],
        },
        render: {
          surface: "markdown",
          blockType: "composite",
        },
      },
    })
    expect(getConfirmedUnsupportedBlockCaseCandidateDefinition("se3-oglink-og_bSize")).toMatchObject({
      id: "rich-html-card",
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
    })
  })

  it("matches warning text back to the representative case id", () => {
    const definition = unsupportedBlockCaseDefinitions.find(
      (candidate) => candidate.id === "se3-oglink-og_bSize",
    )!

    expect(getUnsupportedBlockCaseDefinitionByWarningText(definition.warningText)?.id).toBe(
      "se3-oglink-og_bSize",
    )
    expect(getUnsupportedBlockCaseIdByWarningText(definition.warningText)).toBe(
      "se3-oglink-og_bSize",
    )
  })

  it("renders preview snippets from the resolved AST blocks instead of static candidate text", () => {
    const options = defaultExportOptions()

    const markdownSummaryPreview = renderUnsupportedBlockCaseCandidatePreview({
      caseId: "se3-oglink-og_bSize",
      candidateId: "markdown-image-summary",
      linkStyle: options.markdown.linkStyle,
      includeImageCaptions: options.assets.includeImageCaptions,
      imageHandlingMode: options.assets.imageHandlingMode,
    })
    const gifPreview = renderUnsupportedBlockCaseCandidatePreview({
      caseId: "se2-inline-gif-video",
      candidateId: "linked-poster-image",
      linkStyle: options.markdown.linkStyle,
      includeImageCaptions: options.assets.includeImageCaptions,
      imageHandlingMode: options.assets.imageHandlingMode,
    })

    expect(markdownSummaryPreview).toContain("../../public/")
    expect(markdownSummaryPreview).toContain("blog.naver.com")
    expect(gifPreview).toContain("../../public/123.gif")
    expect(gifPreview).toContain("type=mp4w800")
  })
})
