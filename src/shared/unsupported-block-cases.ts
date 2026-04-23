import { renderResolvedBlocksPreview } from "./block-output-preview.js"
import { buildUnsupportedBlockCaseBlocks } from "./unsupported-block-resolution.js"
import type {
  ExportOptions,
  UnsupportedBlockCandidateId,
  UnsupportedBlockCaseCandidateResolution,
  UnsupportedBlockCaseSelections,
  UnsupportedBlockCaseSelection,
  UnsupportedBlockCaseId,
  UnsupportedBlockInstance,
} from "./types.js"

export type UnsupportedBlockCandidateDefinition<
  CaseId extends UnsupportedBlockCaseId = UnsupportedBlockCaseId,
> = {
  id: UnsupportedBlockCandidateId<CaseId>
  label: string
  description: string
  preview: string
  resolution: UnsupportedBlockCaseCandidateResolution
}

export type UnsupportedBlockCaseDefinition<
  CaseId extends UnsupportedBlockCaseId = UnsupportedBlockCaseId,
> = {
  id: CaseId
  label: string
  description: string
  sampleId: string
  sourceUrl: string
  warningText: string
  selector: string
  currentOutput: string
  candidates: UnsupportedBlockCandidateDefinition<CaseId>[]
  recommendedCandidateId: UnsupportedBlockCandidateId<CaseId>
  confirmedCandidateId: UnsupportedBlockCandidateId<CaseId>
}

const defineUnsupportedBlockCase = <const CaseId extends UnsupportedBlockCaseId>(
  definition: UnsupportedBlockCaseDefinition<CaseId>,
) => definition

const singleBlockResolution = ({
  blockType,
  render,
}: {
  blockType: UnsupportedBlockCaseCandidateResolution["ast"]["blockTypes"][number]
  render: UnsupportedBlockCaseCandidateResolution["render"]
}): UnsupportedBlockCaseCandidateResolution => ({
  ast: {
    blockTypes: [blockType],
  },
  render,
})

const gifPosterUrl = "https://mblogthumb-phinf.pstatic.net/MjAxOTAyMDZfMTUz/MDAxNTQ5NDEzOTc5ODQy.dIfNXspKNS2I29ivFYqiUMxLCDJV17xWrtjut7p5etEg.Cwrfu83gmXKmtAz3wIAi-nOGgZtmy9FmvNu6zdDEg_Eg.GIF.mym0404/123.gif?type=w210"
const gifMp4Url = "https://mblogvideo-phinf.pstatic.net/MjAxOTAyMDZfMTUz/MDAxNTQ5NDEzOTc5ODQy.dIfNXspKNS2I29ivFYqiUMxLCDJV17xWrtjut7p5etEg.Cwrfu83gmXKmtAz3wIAi-nOGgZtmy9FmvNu6zdDEg_Eg.GIF.mym0404/123.gif?type=mp4w800"
const ogLinkUrl = "https://blog.naver.com/is02019/221072284462"
const ogImageUrl = "https://dthumb-phinf.pstatic.net/?src=%22https%3A%2F%2Fblogthumb.pstatic.net%2FMjAxNzA4MTVfNDMg%2FMDAxNTAyODA0MjkzODM1.u5F0sCir7QjJker3XId4S2BkVVyNvQybMU57vAhOJTUg.49IPaap9vWSaeUoAuLHe8QB4NkcLreJd3KGY60lHuPYg.JPEG.is02019%2F20170811_230234.jpg%3Ftype%3Dw2%22&type=ff500_300"
const ogTitle = "[Review PS Vita Part1] 비타는 삶이다 - 소니 PS Vita"
const ogDescription = "SONY PS Vita안녕하세요. 게임최고RedSoul입니다. 이번에는 PS Vita를 리뷰해볼까합니다. 원래..."
const ogPublisher = "blog.naver.com"

export const unsupportedBlockCaseDefinitions = [
  defineUnsupportedBlockCase({
    id: "se2-inline-gif-video",
    label: "SE2 인라인 GIF video",
    description: "문단 안에 텍스트 없이 `_gifmp4` video만 들어 있는 사례다. 실제 렌더는 자동 재생 GIF처럼 보인다.",
    sampleId: "se2-table-rawhtml-navigation",
    sourceUrl: "https://m.blog.naver.com/mym0404/221459172607",
    warningText: "SE2 블록을 해석하지 못해 raw HTML로 남겼습니다: <p>",
    selector: "p > video.fx._postImage._gifmp4[data-gif-url]",
    currentOutput: "현재 export는 raw HTML을 생략하고 경고만 남긴다.",
    candidates: [
      {
        id: "linked-poster-image",
        label: "포스터 이미지 + mp4 링크",
        description: "정지 이미지를 보여주고 클릭 시 mp4 원본으로 이동한다. 정적 Markdown에서 실제 체감과 가장 가깝다.",
        preview: `[![](${gifPosterUrl})](${gifMp4Url})`,
        resolution: singleBlockResolution({
          blockType: "image",
          render: {
            surface: "markdown",
            blockType: "image",
            selection: {
              variant: "linked-image",
            },
          },
        }),
      },
      {
        id: "poster-image-only",
        label: "포스터 이미지만 유지",
        description: "본문 시각 밀도는 유지하지만 움직임과 원본 진입점은 포기한다.",
        preview: `![](${gifPosterUrl})`,
        resolution: singleBlockResolution({
          blockType: "image",
          render: {
            surface: "markdown",
            blockType: "image",
            selection: {
              variant: "markdown-image",
            },
          },
        }),
      },
      {
        id: "source-link-only",
        label: "GIF 링크만 유지",
        description: "자산 의존 없이 안전하지만 실제 렌더 정보가 가장 많이 줄어든다.",
        preview: `[GIF video](${gifMp4Url})`,
        resolution: singleBlockResolution({
          blockType: "video",
          render: {
            surface: "markdown",
            blockType: "video",
            selection: {
              variant: "source-link",
            },
          },
        }),
      },
    ],
    recommendedCandidateId: "linked-poster-image",
    confirmedCandidateId: "linked-poster-image",
  }),
  defineUnsupportedBlockCase({
    id: "se3-horizontal-line-default",
    label: "SE3 horizontalLine default",
    description: "본문 중간의 기본형 가는 구분선 사례다. 텍스트가 없고 렌더 차이는 style token에만 걸린다.",
    sampleId: "se3-quote-table-vita",
    sourceUrl: "https://m.blog.naver.com/sekishin/221290869775",
    warningText: "SE3 블록을 구조화하지 못해 텍스트로 변환했습니다: se_component se_horizontalLine default",
    selector: "div.se_component.se_horizontalLine.default",
    currentOutput: "현재 export는 일반 문단 fallback 경고만 남기고 실제 구분선 의미를 보존하지 못한다.",
    candidates: [
      {
        id: "markdown-hr",
        label: "`---` 구분선",
        description: "가장 범용적인 Markdown 수평선으로 단순화한다.",
        preview: "---",
        resolution: singleBlockResolution({
          blockType: "divider",
          render: {
            surface: "markdown",
            blockType: "divider",
            selection: {
              variant: "dash-rule",
            },
          },
        }),
      },
      {
        id: "asterisk-hr",
        label: "`***` 구분선",
        description: "동일한 의미를 유지하면서 조금 더 강한 시각 인상을 줄 수 있다.",
        preview: "***",
        resolution: singleBlockResolution({
          blockType: "divider",
          render: {
            surface: "markdown",
            blockType: "divider",
            selection: {
              variant: "asterisk-rule",
            },
          },
        }),
      },
      {
        id: "html-default-hr",
        label: "default 스타일 HTML",
        description: "SE3 default 토큰을 데이터 속성으로 남겨 후단 렌더러가 스타일을 보존할 수 있게 한다.",
        preview: `<hr data-naver-block="se3-horizontal-line" data-style="default">`,
        resolution: singleBlockResolution({
          blockType: "htmlFragment",
          render: {
            surface: "html",
            blockType: "htmlFragment",
            htmlTag: "hr",
          },
        }),
      },
    ],
    recommendedCandidateId: "markdown-hr",
    confirmedCandidateId: "markdown-hr",
  }),
  defineUnsupportedBlockCase({
    id: "se3-horizontal-line-line5",
    label: "SE3 horizontalLine line5",
    description: "같은 수평선 block이지만 `line5` 토큰을 가진 사례다. default와 DOM 구조는 같고 시각 스타일만 다르다.",
    sampleId: "se3-quote-table-vita",
    sourceUrl: "https://m.blog.naver.com/sekishin/221290869775",
    warningText: "SE3 블록을 구조화하지 못해 텍스트로 변환했습니다: se_component se_horizontalLine line5",
    selector: "div.se_component.se_horizontalLine.line5",
    currentOutput: "현재 export는 default와 구분되지 않는 fallback 경고만 남긴다.",
    candidates: [
      {
        id: "html-line5-hr",
        label: "line5 스타일 HTML",
        description: "style token을 직접 남겨 default와 다른 라인을 나중에도 구분할 수 있다.",
        preview: `<hr data-naver-block="se3-horizontal-line" data-style="line5">`,
        resolution: singleBlockResolution({
          blockType: "htmlFragment",
          render: {
            surface: "html",
            blockType: "htmlFragment",
            htmlTag: "hr",
          },
        }),
      },
      {
        id: "markdown-hr",
        label: "`---` 구분선",
        description: "구현은 가장 단순하지만 default와의 시각 차이는 사라진다.",
        preview: "---",
        resolution: singleBlockResolution({
          blockType: "divider",
          render: {
            surface: "markdown",
            blockType: "divider",
            selection: {
              variant: "dash-rule",
            },
          },
        }),
      },
      {
        id: "asterisk-hr",
        label: "`***` 구분선",
        description: "line5를 더 강한 구분선으로 해석하는 대안이다.",
        preview: "***",
        resolution: singleBlockResolution({
          blockType: "divider",
          render: {
            surface: "markdown",
            blockType: "divider",
            selection: {
              variant: "asterisk-rule",
            },
          },
        }),
      },
    ],
    recommendedCandidateId: "html-line5-hr",
    confirmedCandidateId: "html-line5-hr",
  }),
  defineUnsupportedBlockCase({
    id: "se3-oglink-og_bSize",
    label: "SE3 oglink og_bSize",
    description: "썸네일, 제목, 설명, 출처가 모두 있는 큰 링크 카드 사례다. 실제 렌더는 카드형 anchor 한 덩어리다.",
    sampleId: "se3-quote-table-vita",
    sourceUrl: "https://m.blog.naver.com/sekishin/221290869775",
    warningText: "SE3 블록을 구조화하지 못해 텍스트로 변환했습니다: se_component se_oglink og_bSize ",
    selector: "div.se_component.se_oglink.og_bSize",
    currentOutput: "현재 export는 이미지와 텍스트를 단순 문단 묶음으로 풀어 썸네일-메타 결속이 약해진다.",
    candidates: [
      {
        id: "rich-html-card",
        label: "썸네일 포함 HTML 카드",
        description: "실제 네이버 카드 구조를 가장 가깝게 옮긴다.",
        preview: `<a href="${ogLinkUrl}">
  <img src="${ogImageUrl}" alt="">
  <strong>${ogTitle}</strong>
  <span>${ogDescription}</span>
  <span>${ogPublisher}</span>
</a>`,
        resolution: singleBlockResolution({
          blockType: "htmlFragment",
          render: {
            surface: "html",
            blockType: "htmlFragment",
            htmlTag: "a",
          },
        }),
      },
      {
        id: "markdown-image-summary",
        label: "썸네일 + 제목 링크 + 설명",
        description: "Markdown 친화적으로 풀어 쓰되 카드의 핵심 정보는 유지한다.",
        preview: `[![](${ogImageUrl})](${ogLinkUrl})

[${ogTitle}](${ogLinkUrl})
${ogDescription}
${ogPublisher}`,
        resolution: {
          ast: {
            blockTypes: ["image", "paragraph", "paragraph", "paragraph"],
          },
          render: {
            surface: "markdown",
            blockType: "composite",
            sections: ["linked-thumbnail", "linked-title", "description", "publisher"],
          },
        },
      },
      {
        id: "title-link-only",
        label: "제목 링크만 유지",
        description: "본문을 짧게 유지하지만 설명과 출처, 썸네일 정보는 잃는다.",
        preview: `[${ogTitle}](${ogLinkUrl})`,
        resolution: singleBlockResolution({
          blockType: "linkCard",
          render: {
            surface: "markdown",
            blockType: "linkCard",
            selection: {
              variant: "title-link",
            },
          },
        }),
      },
    ],
    recommendedCandidateId: "rich-html-card",
    confirmedCandidateId: "rich-html-card",
  }),
] satisfies UnsupportedBlockCaseDefinition[]

export const unsupportedBlockCaseIds = unsupportedBlockCaseDefinitions.map(
  (definition) => definition.id,
)

const unsupportedBlockCaseDefinitionMap = new Map(
  unsupportedBlockCaseDefinitions.map((definition) => [definition.id, definition]),
)
const unsupportedBlockCaseDefinitionByWarningTextMap = new Map(
  unsupportedBlockCaseDefinitions.map((definition) => [definition.warningText, definition]),
)

export const getUnsupportedBlockCaseDefinition = (caseId: UnsupportedBlockCaseId) =>
  unsupportedBlockCaseDefinitionMap.get(caseId)

export const getUnsupportedBlockCaseDefinitionByWarningText = (warningText: string) =>
  unsupportedBlockCaseDefinitionByWarningTextMap.get(warningText)

export const getUnsupportedBlockCaseIdByWarningText = (warningText: string) =>
  getUnsupportedBlockCaseDefinitionByWarningText(warningText)?.id

export const getUnsupportedBlockCaseCandidateDefinition = <CaseId extends UnsupportedBlockCaseId>({
  caseId,
  candidateId,
}: {
  caseId: CaseId
  candidateId: UnsupportedBlockCandidateId<CaseId>
}) =>
  getUnsupportedBlockCaseDefinition(caseId)?.candidates.find(
    (candidate) => candidate.id === candidateId,
  ) as UnsupportedBlockCandidateDefinition<CaseId> | undefined

export const getConfirmedUnsupportedBlockCaseCandidateDefinition = <
  CaseId extends UnsupportedBlockCaseId,
>(
  caseId: CaseId,
) => {
  const definition = getUnsupportedBlockCaseDefinition(caseId)

  if (!definition) {
    return undefined
  }

  return getUnsupportedBlockCaseCandidateDefinition({
    caseId,
    candidateId: definition.confirmedCandidateId as UnsupportedBlockCandidateId<CaseId>,
  })
}

const buildPreviewUnsupportedBlock = (
  caseId: UnsupportedBlockCaseId,
): UnsupportedBlockInstance | null => {
  const definition = getUnsupportedBlockCaseDefinition(caseId)

  if (!definition) {
    return null
  }

  if (caseId === "se2-inline-gif-video") {
    return {
      caseId,
      blockIndex: 0,
      warningText: definition.warningText,
      data: {
        sourceUrl: gifMp4Url,
        posterUrl: gifPosterUrl,
      },
    }
  }

  if (caseId === "se3-horizontal-line-default") {
    return {
      caseId,
      blockIndex: 0,
      warningText: definition.warningText,
      data: {
        blockKind: "horizontalLine",
        styleToken: "default",
      },
    }
  }

  if (caseId === "se3-horizontal-line-line5") {
    return {
      caseId,
      blockIndex: 0,
      warningText: definition.warningText,
      data: {
        blockKind: "horizontalLine",
        styleToken: "line5",
      },
    }
  }

  if (caseId === "se3-oglink-og_bSize") {
    return {
      caseId,
      blockIndex: 0,
      warningText: definition.warningText,
      data: {
        url: ogLinkUrl,
        title: ogTitle,
        description: ogDescription,
        publisher: ogPublisher,
        imageUrl: ogImageUrl,
        sizeToken: "og_bSize",
      },
    }
  }

  return null
}

export const renderUnsupportedBlockCaseCandidatePreview = <CaseId extends UnsupportedBlockCaseId>({
  caseId,
  candidateId,
  linkStyle,
  includeImageCaptions,
  imageHandlingMode,
}: {
  caseId: CaseId
  candidateId: UnsupportedBlockCandidateId<CaseId>
  linkStyle: ExportOptions["markdown"]["linkStyle"]
  includeImageCaptions: boolean
  imageHandlingMode: ExportOptions["assets"]["imageHandlingMode"]
}) => {
  const unsupportedBlock = buildPreviewUnsupportedBlock(caseId)

  if (!unsupportedBlock) {
    return getUnsupportedBlockCaseCandidateDefinition({
      caseId,
      candidateId,
    })?.preview ?? ""
  }

  const blocks = buildUnsupportedBlockCaseBlocks({
    unsupportedBlock,
    candidateId,
  })

  if (blocks.length === 0) {
    return getUnsupportedBlockCaseCandidateDefinition({
      caseId,
      candidateId,
    })?.preview ?? ""
  }

  return renderResolvedBlocksPreview({
    blocks,
    linkStyle,
    includeImageCaptions,
    imageHandlingMode,
  })
}

export const defaultUnsupportedBlockCaseSelections = unsupportedBlockCaseDefinitions.reduce(
  (selections, definition) => ({
    ...selections,
    [definition.id]: {
      candidateId: definition.recommendedCandidateId,
      confirmed: false,
    },
  }),
  {} as UnsupportedBlockCaseSelections,
)

export const resolveUnsupportedBlockCaseSelection = <CaseId extends UnsupportedBlockCaseId>({
  caseId,
  unsupportedBlockCases,
}: {
  caseId: CaseId
  unsupportedBlockCases?: Partial<UnsupportedBlockCaseSelections>
}) => {
  const definition = getUnsupportedBlockCaseDefinition(caseId)
  const selection = unsupportedBlockCases?.[caseId]

  if (!definition || !selection) {
    return defaultUnsupportedBlockCaseSelections[caseId] as UnsupportedBlockCaseSelection<CaseId>
  }

  if (!definition.candidates.some((candidate) => candidate.id === selection.candidateId)) {
    return defaultUnsupportedBlockCaseSelections[caseId] as UnsupportedBlockCaseSelection<CaseId>
  }

  return {
    candidateId: selection.candidateId,
    confirmed: selection.confirmed === true,
  } as UnsupportedBlockCaseSelection<CaseId>
}

export const getUnsupportedBlockCaseConfirmationSummary = ({
  unsupportedBlockCases,
}: {
  unsupportedBlockCases?: Partial<UnsupportedBlockCaseSelections>
}) => {
  const unconfirmedCaseIds = unsupportedBlockCaseIds.filter((caseId) => {
    const selection = resolveUnsupportedBlockCaseSelection({
      caseId,
      unsupportedBlockCases,
    })

    return !selection.confirmed
  })

  return {
    totalCaseCount: unsupportedBlockCaseIds.length,
    confirmedCaseCount: unsupportedBlockCaseIds.length - unconfirmedCaseIds.length,
    unconfirmedCaseIds,
  }
}
