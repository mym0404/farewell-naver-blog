# Unsupported Block Render Resolution Sub-AC 3

## 범위

- 대표 사례 4건마다 캡처와 연결되는 재현용 fixture 근거를 별도 source of truth로 묶었다.
- 묶음 기준은 `source HTML`, `parser input`, `current expected observation` 3축이다.
- 이번 AC의 완료 기준은 각 사례가 capture manifest만 봐도 fixture 근거 파일을 따라갈 수 있고, 테스트가 그 근거를 실제 sample fixture에 다시 대조하는 것이다.

## 묶음 구조

| `caseId` | capture 연결 | source HTML 근거 | parser input | 기대 관찰값 |
| --- | --- | --- | --- | --- |
| `se2-inline-gif-video` | `mym0404-221459172607-se2-inline-gif-video-capture.json` + `fixtureEvidenceId` | `source.html:312`의 `_gifmp4` `<video>` 문단 snippet | `renderSampleFixture` + `sourceUrl=https://blog.naver.com/mym0404/221459172607` + `editorVersion=2` | `expected.md:314` linked poster image 1줄, block type `image` |
| `se3-horizontal-line-default` | `sekishin-221290869775-se3-horizontal-line-default-capture.json` + `fixtureEvidenceId` | `source.html:559`의 `div.se_component.se_horizontalLine.default` | `renderSampleFixture` + `sourceUrl=https://blog.naver.com/sekishin/221290869775` + `editorVersion=3` | `expected.md:33`의 `---`, block type `divider` |
| `se3-horizontal-line-line5` | `sekishin-221290869775-se3-horizontal-line-line5-capture.json` + `fixtureEvidenceId` | `source.html:1482`의 `div.se_component.se_horizontalLine.line5` | `renderSampleFixture` + `sourceUrl=https://blog.naver.com/sekishin/221290869775` + `editorVersion=3` | `expected.md:96`의 `<hr data-naver-block="se3-horizontal-line" data-style="line5">`, block type `htmlFragment` |
| `se3-oglink-og_bSize` | `sekishin-221290869775-se3-oglink-og_bSize-capture.json` + `fixtureEvidenceId` | `source.html:1625`의 `div.se_component.se_oglink.og_bSize` 카드 snippet | `renderSampleFixture` + `sourceUrl=https://blog.naver.com/sekishin/221290869775` + `editorVersion=3` | `expected.md:105-110`의 HTML card 6줄, block type `htmlFragment` |

## 기대 출력 명세

### `se2-inline-gif-video`

- 확정안: `linked-poster-image`
- 기대 Markdown 출력

```md
[![](https://mblogthumb-phinf.pstatic.net/MjAxOTAyMDZfMTUz/MDAxNTQ5NDEzOTc5ODQy.dIfNXspKNS2I29ivFYqiUMxLCDJV17xWrtjut7p5etEg.Cwrfu83gmXKmtAz3wIAi-nOGgZtmy9FmvNu6zdDEg_Eg.GIF.mym0404/123.gif?type=w210)](https://mblogvideo-phinf.pstatic.net/MjAxOTAyMDZfMTUz/MDAxNTQ5NDEzOTc5ODQy.dIfNXspKNS2I29ivFYqiUMxLCDJV17xWrtjut7p5etEg.Cwrfu83gmXKmtAz3wIAi-nOGgZtmy9FmvNu6zdDEg_Eg.GIF.mym0404/123.gif?type=mp4w800)
```

- 허용 예외: `posterUrl`이 비면 같은 선택안에서도 `[GIF video](sourceUrl)` 1줄로 낮춘다. 이 경우 resolved block type은 `image` 대신 `video`가 된다.
- 검증 예시: `tests/fixtures/samples/se2-table-rawhtml-navigation/expected.md:314`와 `tests/unsupported-block-fixture-evidence.test.ts`의 fixture replay 검증

### `se3-horizontal-line-default`

- 확정안: `markdown-hr`
- 기대 Markdown 출력

```md
---
```

- 허용 예외: 없음. block 사이 공백 줄 수는 renderer 공통 규칙을 따른다.
- 검증 예시: `tests/fixtures/samples/se3-quote-table-vita/expected.md:33`와 `tests/unsupported-block-fixture-evidence.test.ts`의 line slice 검증

### `se3-horizontal-line-line5`

- 확정안: `html-line5-hr`
- 기대 Markdown 출력

```md
<hr data-naver-block="se3-horizontal-line" data-style="line5">
```

- 허용 예외: 없음. `data-style="line5"` 토큰은 유지돼야 하고 `---`나 `***`로 바꾸지 않는다.
- 검증 예시: `tests/fixtures/samples/se3-quote-table-vita/expected.md:96`와 `tests/unsupported-block-fixture-evidence.test.ts`의 resolved block type `htmlFragment` 검증

### `se3-oglink-og_bSize`

- 확정안: `rich-html-card`
- 기대 Markdown 출력

```md
<a data-naver-block="se3-oglink" data-size="og_bSize" href="https://blog.naver.com/is02019/221072284462">
  <img src="https://dthumb-phinf.pstatic.net/?src=%22https%3A%2F%2Fblogthumb.pstatic.net%2FMjAxNzA4MTVfNDMg%2FMDAxNTAyODA0MjkzODM1.u5F0sCir7QjJker3XId4S2BkVVyNvQybMU57vAhOJTUg.49IPaap9vWSaeUoAuLHe8QB4NkcLreJd3KGY60lHuPYg.JPEG.is02019%2F20170811_230234.jpg%3Ftype%3Dw2%22&type=ff500_300" alt="">
  <strong>[Review PS Vita Part1] 비타는 삶이다 - 소니 PS Vita</strong>
  <span>SONY PS Vita안녕하세요. 게임최고RedSoul입니다. 이번에는 PS Vita를 리뷰해볼까합니다. 원래...</span>
  <span>blog.naver.com</span>
</a>
```

- 허용 예외: `imageUrl`이 없으면 `<img>` 줄을 생략한다. `description`, `publisher`가 비면 대응 `<span>` 줄만 각각 생략하고 `<a>`와 `<strong>`은 유지한다.
- 검증 예시: `tests/fixtures/samples/se3-quote-table-vita/expected.md:105-110`와 `tests/unsupported-block-fixture-evidence.test.ts`의 HTML card line slice 검증

## 구현 정리

- `scripts/harness/lib/unsupported-block-fixture-evidence.ts`를 새로 만들고 사례 4건의 fixture evidence를 정형화했다.
- 각 evidence는 `captureManifestPath`, `sourceHtml.snippet`, `parserInput`, `expectedObservation.markdownLine(s)`를 함께 가진다.
- 각 `*-capture.json`의 `references`에 `fixtureEvidenceFile`, `fixtureEvidenceId`를 추가해 캡처와 fixture 근거를 역참조 가능하게 맞췄다.
- 루트 인덱스 `unsupported-block-render-resolution-evidence/index.json`은 `schemaVersion 2 👉 3`으로 올리고 `fixtureEvidenceSource`와 사례별 `fixtureEvidenceId`를 기록했다.

## 재검증 흐름

- 테스트는 각 evidence 항목마다 capture manifest, `sampleCorpus`, unsupported block case 정의가 서로 같은 사례를 가리키는지 먼저 확인한다.
- 이어서 `loadSampleFixture` + `renderSampleFixture`로 실제 fixture를 다시 읽어 source HTML snippet, capability lookup, expected markdown line slice를 재확인한다.
- 이 경로를 통과하면 capture와 연결된 근거가 문서가 아니라 실행 가능한 fixture 검증으로 유지된다.

## 검증

- `tests/unsupported-block-fixture-evidence.test.ts` 추가
- `pnpm check:local`은 현재 환경에서 계속 막힌다. `node_modules` 부재로 `tsc: command not found`

## 결론

- 대표 사례 4건 모두 캡처와 연결되는 재현 가능한 fixture 근거를 갖는다.
- 근거는 sample source HTML, parser input, 현재 expected output을 함께 묶은 구조로 정리됐다.
- 이후 sample fixture가 바뀌면 새 테스트가 line 단위로 어긋남을 바로 드러낸다.
