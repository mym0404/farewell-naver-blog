import type {
  EditorVersion,
  UnsupportedBlockCandidateId,
  UnsupportedBlockCaseId,
  UnsupportedBlockResolvedAstBlockType,
} from "../../../src/shared/types.js"

export type UnsupportedBlockFixtureEvidence<
  CaseId extends UnsupportedBlockCaseId = UnsupportedBlockCaseId,
> = {
  caseId: CaseId
  captureId: string
  captureManifestPath: string
  sampleId: string
  sourceHtml: {
    file: string
    line: number
    selector: string
    snippet: string
    previousTextAnchor: string
    nextTextAnchor: string
  }
  parserInput: {
    entry: "renderSampleFixture"
    sourceUrl: string
    editorVersion: EditorVersion
    warningText: string
    expectedCapabilityLookupId: `case:${CaseId}`
  }
  expectedObservation: {
    selectionCandidateId: UnsupportedBlockCandidateId<CaseId>
    resolvedBlockTypes: UnsupportedBlockResolvedAstBlockType[]
    markdownFile: string
    markdownLine: number
    markdownLines: string[]
  }
}

export const unsupportedBlockFixtureEvidence = [
  {
    caseId: "se2-inline-gif-video",
    captureId: "se2-table-rawhtml-navigation__se2-inline-gif-video",
    captureManifestPath:
      "unsupported-block-render-resolution-evidence/se2-inline-gif-video/mym0404-221459172607-se2-inline-gif-video-capture.json",
    sampleId: "se2-table-rawhtml-navigation",
    sourceHtml: {
      file: "tests/fixtures/samples/se2-table-rawhtml-navigation/source.html",
      line: 312,
      selector: "p > video.fx._postImage._gifmp4[data-gif-url]",
      snippet:
        `<p><video onerror="this.setAttribute('poster', this.getAttribute('data-gif-url'))" onloadedmetadata="var z=this;this.play().catch(function(){z.poster=z.getAttribute('data-gif-url')});" src="https://mblogvideo-phinf.pstatic.net/MjAxOTAyMDZfMTUz/MDAxNTQ5NDEzOTc5ODQy.dIfNXspKNS2I29ivFYqiUMxLCDJV17xWrtjut7p5etEg.Cwrfu83gmXKmtAz3wIAi-nOGgZtmy9FmvNu6zdDEg_Eg.GIF.mym0404/123.gif?type=mp4w800" loop="loop" muted="muted" playsinline class="fx _postImage _gifmp4" data-gif-url="https://mblogthumb-phinf.pstatic.net/MjAxOTAyMDZfMTUz/MDAxNTQ5NDEzOTc5ODQy.dIfNXspKNS2I29ivFYqiUMxLCDJV17xWrtjut7p5etEg.Cwrfu83gmXKmtAz3wIAi-nOGgZtmy9FmvNu6zdDEg_Eg.GIF.mym0404/123.gif?type=w210"></video>&nbsp;</p>`,
      previousTextAnchor: "결과물을 보자!",
      nextTextAnchor: "Navigation | Android Developers",
    },
    parserInput: {
      entry: "renderSampleFixture",
      sourceUrl: "https://blog.naver.com/mym0404/221459172607",
      editorVersion: 2,
      warningText: "SE2 블록을 해석하지 못해 raw HTML로 남겼습니다: <p>",
      expectedCapabilityLookupId: "case:se2-inline-gif-video",
    },
    expectedObservation: {
      selectionCandidateId: "linked-poster-image",
      resolvedBlockTypes: ["image"],
      markdownFile: "tests/fixtures/samples/se2-table-rawhtml-navigation/expected.md",
      markdownLine: 314,
      markdownLines: [
        "[![](https://mblogthumb-phinf.pstatic.net/MjAxOTAyMDZfMTUz/MDAxNTQ5NDEzOTc5ODQy.dIfNXspKNS2I29ivFYqiUMxLCDJV17xWrtjut7p5etEg.Cwrfu83gmXKmtAz3wIAi-nOGgZtmy9FmvNu6zdDEg_Eg.GIF.mym0404/123.gif?type=w210)](https://mblogvideo-phinf.pstatic.net/MjAxOTAyMDZfMTUz/MDAxNTQ5NDEzOTc5ODQy.dIfNXspKNS2I29ivFYqiUMxLCDJV17xWrtjut7p5etEg.Cwrfu83gmXKmtAz3wIAi-nOGgZtmy9FmvNu6zdDEg_Eg.GIF.mym0404/123.gif?type=mp4w800)",
      ],
    },
  },
  {
    caseId: "se3-horizontal-line-default",
    captureId: "se3-quote-table-vita__se3-horizontal-line-default",
    captureManifestPath:
      "unsupported-block-render-resolution-evidence/se3-horizontal-line-default/sekishin-221290869775-se3-horizontal-line-default-capture.json",
    sampleId: "se3-quote-table-vita",
    sourceHtml: {
      file: "tests/fixtures/samples/se3-quote-table-vita/source.html",
      line: 559,
      selector: "div.se_component.se_horizontalLine.default",
      snippet: `<div class="se_component se_horizontalLine default">
    <div class="se_sectionArea">
        <div class="se_editArea">
            <div class="viewArea">
                <div class="se_horizontalLineView">
                    <div class="se_hr"><hr></div>
                </div>
            </div>
        </div>
    </div>
</div>`,
      previousTextAnchor: "안녕하세요. 게임최고 RedSoul입니다.",
      nextTextAnchor: "이 게임은...",
    },
    parserInput: {
      entry: "renderSampleFixture",
      sourceUrl: "https://blog.naver.com/sekishin/221290869775",
      editorVersion: 3,
      warningText: "SE3 블록을 구조화하지 못해 텍스트로 변환했습니다: se_component se_horizontalLine default",
      expectedCapabilityLookupId: "case:se3-horizontal-line-default",
    },
    expectedObservation: {
      selectionCandidateId: "markdown-hr",
      resolvedBlockTypes: ["divider"],
      markdownFile: "tests/fixtures/samples/se3-quote-table-vita/expected.md",
      markdownLine: 33,
      markdownLines: ["---"],
    },
  },
  {
    caseId: "se3-horizontal-line-line5",
    captureId: "se3-quote-table-vita__se3-horizontal-line-line5",
    captureManifestPath:
      "unsupported-block-render-resolution-evidence/se3-horizontal-line-line5/sekishin-221290869775-se3-horizontal-line-line5-capture.json",
    sampleId: "se3-quote-table-vita",
    sourceHtml: {
      file: "tests/fixtures/samples/se3-quote-table-vita/source.html",
      line: 1482,
      selector: "div.se_component.se_horizontalLine.line5",
      snippet: `<div class="se_component se_horizontalLine line5">
    <div class="se_sectionArea">
        <div class="se_editArea">
            <div class="viewArea">
                <div class="se_horizontalLineView">
                    <div class="se_hr"><hr></div>
                </div>
            </div>
        </div>
    </div>
</div>`,
      previousTextAnchor: "게임은 반복적이고 지루하지만 건프라는 자유다!!",
      nextTextAnchor: "후기",
    },
    parserInput: {
      entry: "renderSampleFixture",
      sourceUrl: "https://blog.naver.com/sekishin/221290869775",
      editorVersion: 3,
      warningText: "SE3 블록을 구조화하지 못해 텍스트로 변환했습니다: se_component se_horizontalLine line5",
      expectedCapabilityLookupId: "case:se3-horizontal-line-line5",
    },
    expectedObservation: {
      selectionCandidateId: "html-line5-hr",
      resolvedBlockTypes: ["htmlFragment"],
      markdownFile: "tests/fixtures/samples/se3-quote-table-vita/expected.md",
      markdownLine: 96,
      markdownLines: ['<hr data-naver-block="se3-horizontal-line" data-style="line5">'],
    },
  },
  {
    caseId: "se3-oglink-og_bSize",
    captureId: "se3-quote-table-vita__se3-oglink-og_bSize",
    captureManifestPath:
      "unsupported-block-render-resolution-evidence/se3-oglink-og_bSize/sekishin-221290869775-se3-oglink-og_bSize-capture.json",
    sampleId: "se3-quote-table-vita",
    sourceHtml: {
      file: "tests/fixtures/samples/se3-quote-table-vita/source.html",
      line: 1625,
      selector: "div.se_component.se_oglink.og_bSize",
      snippet: `<div class="se_component se_oglink og_bSize ">
    <div class="se_sectionArea se_align-center">
        <div class="se_editArea" id="SEDOC-1529308581022-1623543367_oglink_0">
            <div class="se_viewArea se_og_wrap">
                <a class="se_og_box  __se_link" href="https://blog.naver.com/is02019/221072284462" target="_blank" data-linktype="link" data-linkdata='{"link" : "https://blog.naver.com/is02019/221072284462"}'>
                    <div class="se_og_thumb">
                        <img src="https://dthumb-phinf.pstatic.net/?src&#61;%22https%3A%2F%2Fblogthumb.pstatic.net%2FMjAxNzA4MTVfNDMg%2FMDAxNTAyODA0MjkzODM1.u5F0sCir7QjJker3XId4S2BkVVyNvQybMU57vAhOJTUg.49IPaap9vWSaeUoAuLHe8QB4NkcLreJd3KGY60lHuPYg.JPEG.is02019%2F20170811_230234.jpg%3Ftype%3Dw2%22&amp;type&#61;ff500_300" alt="">
					</div>
                    <div class="se_og_txt">
                            <div class="se_og_tit">[Review PS Vita Part1] 비타는 삶이다 - 소니 PS Vita</div>
                                <div class="se_og_desc">SONY PS Vita안녕하세요. 게임최고RedSoul입니다. 이번에는 PS Vita를 리뷰해볼까합니다. 원래...</div>
                            <div class="se_og_cp">blog.naver.com</div>

                    </div>
                </a>
            </div>
        </div>
    </div>
</div>`,
      previousTextAnchor: "이상 리뷰를 마치도록 하겠습니다.",
      nextTextAnchor: "[Review PS Vita Part1] 비타는 삶이다 - 소니 PS Vita",
    },
    parserInput: {
      entry: "renderSampleFixture",
      sourceUrl: "https://blog.naver.com/sekishin/221290869775",
      editorVersion: 3,
      warningText: "SE3 블록을 구조화하지 못해 텍스트로 변환했습니다: se_component se_oglink og_bSize ",
      expectedCapabilityLookupId: "case:se3-oglink-og_bSize",
    },
    expectedObservation: {
      selectionCandidateId: "rich-html-card",
      resolvedBlockTypes: ["htmlFragment"],
      markdownFile: "tests/fixtures/samples/se3-quote-table-vita/expected.md",
      markdownLine: 105,
      markdownLines: [
        '<a data-naver-block="se3-oglink" data-size="og_bSize" href="https://blog.naver.com/is02019/221072284462">',
        '  <img src="https://dthumb-phinf.pstatic.net/?src=%22https%3A%2F%2Fblogthumb.pstatic.net%2FMjAxNzA4MTVfNDMg%2FMDAxNTAyODA0MjkzODM1.u5F0sCir7QjJker3XId4S2BkVVyNvQybMU57vAhOJTUg.49IPaap9vWSaeUoAuLHe8QB4NkcLreJd3KGY60lHuPYg.JPEG.is02019%2F20170811_230234.jpg%3Ftype%3Dw2%22&amp;type=ff500_300" alt="">',
        "  <strong>[Review PS Vita Part1] 비타는 삶이다 - 소니 PS Vita</strong>",
        "  <span>SONY PS Vita안녕하세요. 게임최고RedSoul입니다. 이번에는 PS Vita를 리뷰해볼까합니다. 원래...</span>",
        "  <span>blog.naver.com</span>",
        "</a>",
      ],
    },
  },
] satisfies UnsupportedBlockFixtureEvidence[]

export const getUnsupportedBlockFixtureEvidence = (caseId: UnsupportedBlockCaseId) =>
  unsupportedBlockFixtureEvidence.find((evidence) => evidence.caseId === caseId)
