# Unsupported Block Render Resolution Sub-AC 2

## 범위

- AC 1에서 확정한 warning 기준 미지원 조합 4건을 같은 식별 키 기준으로 다시 정리했다.
- 루트 인덱스 [unsupported-block-render-resolution-evidence/index.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/index.json:1)에 `captureKeyFields`, `sourceIndex`, `reuseKeyMap`, `captureMatrix`를 추가해 조합별 캡처 매핑표를 남겼다.
- 케이스별 `-capture.json`에도 같은 `identificationKey`를 넣어서, 루트 인덱스를 보지 않아도 개별 증적만으로 재사용 판단이 가능하게 맞췄다.

## 대표 사례 매핑 확정

| 조합 식별자 | 대표 sampleId | source 식별자 | source 근거 | warning 근거 | 대표 선정 근거 |
| --- | --- | --- | --- | --- | --- |
| `se2-inline-gif-video` | `se2-table-rawhtml-navigation` | `mym0404/221459172607` | [src/shared/sample-corpus.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/sample-corpus.ts:194), [tests/fixtures/samples/se2-table-rawhtml-navigation/expected.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se2-table-rawhtml-navigation/expected.md:3) | [tests/fixtures/samples/se2-table-rawhtml-navigation/source.html](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se2-table-rawhtml-navigation/source.html:312), [tests/fixtures/samples/se2-table-rawhtml-navigation/expected.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se2-table-rawhtml-navigation/expected.md:15) | 현재 corpus에서 `SE2 블록을 해석하지 못해 raw HTML로 남겼습니다: <p>` warning이 나는 사례가 이 sample 1건뿐이다. 같은 문단 바로 뒤에 일반 oglink가 이어져서, 이후 후보안 비교 때 `gif mp4` 단독 block과 링크 카드가 섞이지 않는지 함께 확인하기 좋다. |
| `se3-horizontal-line-default` | `se3-quote-table-vita` | `sekishin/221290869775` | [src/shared/sample-corpus.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/sample-corpus.ts:282), [tests/fixtures/samples/se3-quote-table-vita/expected.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/expected.md:3) | [tests/fixtures/samples/se3-quote-table-vita/source.html](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/source.html:559), [tests/fixtures/samples/se3-quote-table-vita/expected.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/expected.md:15) | `se_horizontalLine default` warning은 corpus 전체에서 이 1건만 나온다. 같은 sample 안에 `line5`도 같이 있어서, 같은 block type 안에서 style token 차이를 대표 사례 2건으로 나눠 관리하기 가장 좋다. |
| `se3-horizontal-line-line5` | `se3-quote-table-vita` | `sekishin/221290869775` | [src/shared/sample-corpus.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/sample-corpus.ts:282), [tests/fixtures/samples/se3-quote-table-vita/expected.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/expected.md:3) | [tests/fixtures/samples/se3-quote-table-vita/source.html](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/source.html:1482), [tests/fixtures/samples/se3-quote-table-vita/expected.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/expected.md:16) | `se_horizontalLine line5` warning도 corpus 전체에서 이 1건뿐이다. `default`와 DOM 뼈대는 같지만 class token이 다르므로, 같은 source 안의 쌍 비교가 가장 안정적인 대표 케이스다. |
| `se3-oglink-og_bSize` | `se3-quote-table-vita` | `sekishin/221290869775` | [src/shared/sample-corpus.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/sample-corpus.ts:282), [tests/fixtures/samples/se3-quote-table-vita/expected.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/expected.md:3) | [tests/fixtures/samples/se3-quote-table-vita/source.html](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/source.html:1625), [tests/fixtures/samples/se3-quote-table-vita/expected.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/expected.md:17) | `og_bSize` warning은 corpus 전체에서 이 1건만 나온다. 썸네일, 제목, 설명, 출처가 모두 채워져 있어서 이후 변환 후보안을 비교할 때 정보 손실 여부를 가장 분명하게 판단할 수 있다. |

## 식별 키 기준

| `reuseKey` | `editorVersion` | top-level 시그니처 | child 시그니처 | 텍스트 상태 | variant token |
| --- | --- | --- | --- | --- | --- |
| `se2-inline-gif-video` | `2` | `p` | `video.fx._postImage._gifmp4[data-gif-url]` | `none` | `gifmp4`, `data-gif-url` |
| `se3-horizontal-line-default` | `3` | `div.se_component.se_horizontalLine.default` | `.se_horizontalLineView > .se_hr > hr` | `none` | `se_horizontalLine`, `default` |
| `se3-horizontal-line-line5` | `3` | `div.se_component.se_horizontalLine.line5` | `.se_horizontalLineView > .se_hr > hr` | `none` | `se_horizontalLine`, `line5` |
| `se3-oglink-og_bSize` | `3` | `div.se_component.se_oglink.og_bSize` | `.se_og_thumb + .se_og_tit + .se_og_desc + .se_og_cp` | `structured` | `se_oglink`, `og_bSize`, `thumb`, `title`, `desc`, `cp` |

## 조합별 캡처 매핑표

| `reuseKey` | 대표 source | `captureId` | manifest | block/context PNG | options note |
| --- | --- | --- | --- | --- | --- |
| `se2-inline-gif-video` | `mym0404/221459172607` | `se2-table-rawhtml-navigation__se2-inline-gif-video` | [mym0404-221459172607-se2-inline-gif-video-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se2-inline-gif-video/mym0404-221459172607-se2-inline-gif-video-capture.json:1) | `false / false` | [mym0404-221459172607-se2-inline-gif-video-options.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se2-inline-gif-video/mym0404-221459172607-se2-inline-gif-video-options.md:1) |
| `se3-horizontal-line-default` | `sekishin/221290869775` | `se3-quote-table-vita__se3-horizontal-line-default` | [sekishin-221290869775-se3-horizontal-line-default-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-default/sekishin-221290869775-se3-horizontal-line-default-capture.json:1) | `false / false` | [sekishin-221290869775-se3-horizontal-line-default-options.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-default/sekishin-221290869775-se3-horizontal-line-default-options.md:1) |
| `se3-horizontal-line-line5` | `sekishin/221290869775` | `se3-quote-table-vita__se3-horizontal-line-line5` | [sekishin-221290869775-se3-horizontal-line-line5-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-line5/sekishin-221290869775-se3-horizontal-line-line5-capture.json:1) | `false / false` | [sekishin-221290869775-se3-horizontal-line-line5-options.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-line5/sekishin-221290869775-se3-horizontal-line-line5-options.md:1) |
| `se3-oglink-og_bSize` | `sekishin/221290869775` | `se3-quote-table-vita__se3-oglink-og_bSize` | [sekishin-221290869775-se3-oglink-og_bSize-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-oglink-og_bSize/sekishin-221290869775-se3-oglink-og_bSize-capture.json:1) | `false / false` | [sekishin-221290869775-se3-oglink-og_bSize-options.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-oglink-og_bSize/sekishin-221290869775-se3-oglink-og_bSize-options.md:1) |

## source별 묶음

| source | sample | 포함 `reuseKey` | 포함 `captureId` |
| --- | --- | --- | --- |
| `mym0404/221459172607` | `se2-table-rawhtml-navigation` | `se2-inline-gif-video` | `se2-table-rawhtml-navigation__se2-inline-gif-video` |
| `sekishin/221290869775` | `se3-quote-table-vita` | `se3-horizontal-line-default`, `se3-horizontal-line-line5`, `se3-oglink-og_bSize` | `se3-quote-table-vita__se3-horizontal-line-default`, `se3-quote-table-vita__se3-horizontal-line-line5`, `se3-quote-table-vita__se3-oglink-og_bSize` |

## 유일성 확인

- `SE2 블록을 해석하지 못해 raw HTML로 남겼습니다: <p>` warning은 [tests/fixtures/samples/se2-table-rawhtml-navigation/expected.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se2-table-rawhtml-navigation/expected.md:15) 1건만 검색된다.
- `se_horizontalLine default`, `se_horizontalLine line5`, `se_oglink og_bSize` warning은 모두 [tests/fixtures/samples/se3-quote-table-vita/expected.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/expected.md:15), [tests/fixtures/samples/se3-quote-table-vita/expected.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/expected.md:16), [tests/fixtures/samples/se3-quote-table-vita/expected.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/expected.md:17)에서만 검색된다.
- `_gifmp4` 문자열은 다른 fixture의 스크립트에도 있지만, 실제 warning으로 이어지는 `p > video._gifmp4[data-gif-url]` 본문 block은 [tests/fixtures/samples/se2-table-rawhtml-navigation/source.html](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se2-table-rawhtml-navigation/source.html:312)만 대표 대상으로 채택했다.

## 재사용 결론

- `se2-inline-gif-video` 대표 사례는 `editorVersion 2 + p + video._gifmp4 + data-gif-url + 문단 텍스트 없음` 조합에만 재사용한다.
- `se3-horizontal-line-default` 대표 사례는 `editorVersion 3 + se_horizontalLine + default` 조합에만 재사용한다.
- `se3-horizontal-line-line5` 대표 사례는 `editorVersion 3 + se_horizontalLine + line5` 조합에만 재사용한다.
- `se3-oglink-og_bSize` 대표 사례는 `editorVersion 3 + se_oglink + og_bSize + thumb/title/desc/cp 존재` 조합에만 재사용한다.
- 같은 block type이라도 `variantTokens`가 달라지면 기존 `reuseKey`에 합치지 않고 새 조합을 만든다.

## 합의 기록

| 식별자 | 비교표 기준 최종 선택안 | 선택 사유 | 예외 규칙 |
| --- | --- | --- | --- |
| `se2-inline-gif-video` | `linked-poster-image` | 실제 네이버 렌더에서 먼저 보이는 정보가 움직임보다 포스터 이미지에 가깝고, 클릭 시 mp4로 이어지는 진입점도 함께 남겨야 한다. `source-link-only`보다 본문 존재감이 크고, `poster-image-only`보다 원본 접근 경로 손실이 적다. | `posterUrl`이 비어 있으면 같은 후보안 이름을 억지로 유지하지 않고 `source-link-only`로 낮춘다. 이 합의는 `p > video._gifmp4[data-gif-url]` 단독 문단에만 적용하고, 텍스트가 섞인 문단이나 일반 video block에는 재사용하지 않는다. |
| `se3-horizontal-line-default` | `markdown-hr` | `default` 라인은 의미가 구분선 자체에 있고 스타일 토큰 보존 이득보다 Markdown 호환성이 더 크다. 기본형까지 HTML로 고정하면 후단 렌더 의존만 늘어나므로, 기본형은 범용 구분선으로 단순화하는 쪽으로 정했다. | 같은 horizontalLine이어도 `line5`에는 이 결론을 재사용하지 않는다. 이후 다른 style token이 나오면 `default`에 합치지 않고 별도 후보안 비교를 다시 거친다. |
| `se3-horizontal-line-line5` | `html-line5-hr` | `line5`는 `default`와 같은 divider 의미라도 실제 렌더 차이를 만드는 토큰이라서, 이 케이스까지 `---`로 합치면 같은 block type 안의 차이가 사라진다. 비교표에서 `default`와 다른 예외 취급이 필요하다는 점을 우선했다. | 예외 규칙은 `styleToken=line5`일 때만 적용한다. 같은 DOM 뼈대를 써도 다른 token이 나오면 새 조합으로 분리하고, `line5`를 horizontalLine 전역 기본값으로 올리지 않는다. |
| `se3-oglink-og_bSize` | `rich-html-card` | 실제 렌더 핵심이 썸네일, 제목, 설명, 출처가 한 anchor 카드로 묶여 있다는 점이라서, 정보를 줄바꿈 문단으로 흩뜨리는 안보다 카드 결속을 유지하는 안이 더 맞다. 이 사례는 메타가 모두 채워져 있어 카드형 HTML 선택 근거가 가장 분명하다. | `og_bSize`와 `thumb/title/desc/cp` 조합이 모두 있을 때만 이 선택을 재사용한다. 썸네일이 빠지거나 다른 size token이 나오면 같은 oglink라도 새 사례로 분리하고, Markdown 대안으로 자동 강등하지 않는다. |

- 위 최종 선택안은 비교표 결론과 [src/shared/parser-capabilities.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/parser-capabilities.ts:18)의 `confirmedCandidateId`를 같은 값으로 맞춘 기준이다.
- 합의 단위는 block type 전역 규칙이 아니라 `reuseKey` 단위다. `horizontalLine`처럼 block type이 같아도 token이 다르면 선택안도 따로 유지한다.

## 확정 상태

- 대표 사례 조합 수: `4`
- 대표 source 수: `2`
- 대표 source 식별자: `mym0404/221459172607`, `sekishin/221290869775`

## 현재 캡처 상태

- `captureMatrix` 기준 상태는 4건 모두 `pending-capture`다.
- 현재 저장물은 `capture.json 4건`, `options.md 4건`이고, PNG 존재 플래그는 모두 `false`다.
- 이번 AC의 완료 기준인 조합별 캡처 매핑표 정리는 끝났고, 실제 PNG 수집은 다음 단계에서 같은 `reuseKey`와 `captureId`를 그대로 이어서 진행하면 된다.
