# Unsupported Block Render Resolution Sub-AC 1

## 범위

- baseline output에서 warning이 발생했던 sample은 `se2-table-rawhtml-navigation`, `se3-quote-table-vita` 두 건이다.
- warning 기준 미지원 사례는 총 4건이고, corpus 기준 렌더 차이에 영향을 주는 속성 조합도 4개다.
- corpus 등록 기준 대표 sample은 [src/shared/sample-corpus.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/sample-corpus.ts:197), [src/shared/sample-corpus.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/sample-corpus.ts:287) 두 건이다.
- 현재 `expected.md`는 구현 후 warning-free 상태라, 당시 warning 위치는 각 case의 capture manifest에 고정해 추적한다.

## inventory

| 식별자 | corpus / sample | source capability / case registry | source block 위치 | warning 위치 | 추적 근거 |
| --- | --- | --- | --- | --- | --- |
| `se2-inline-gif-video` | [src/shared/sample-corpus.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/sample-corpus.ts:197) `se2-table-rawhtml-navigation` | [src/shared/parser-capabilities.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/parser-capabilities.ts:24) `se2-rawHtml`, [src/shared/unsupported-block-cases.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/unsupported-block-cases.ts:65) `SE2 인라인 GIF video` | [tests/fixtures/samples/se2-table-rawhtml-navigation/source.html](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se2-table-rawhtml-navigation/source.html:312) `p > video.fx._postImage._gifmp4[data-gif-url]` | [mym0404-221459172607-se2-inline-gif-video-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se2-inline-gif-video/mym0404-221459172607-se2-inline-gif-video-capture.json:18) `expected.md:15` 기록 | [unsupported-block-render-resolution-evidence/index.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/index.json:100), [mym0404-221459172607-se2-inline-gif-video-options.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se2-inline-gif-video/mym0404-221459172607-se2-inline-gif-video-options.md:1) |
| `se3-horizontal-line-default` | [src/shared/sample-corpus.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/sample-corpus.ts:287) `se3-quote-table-vita` | [src/shared/parser-capabilities.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/parser-capabilities.ts:30) `se3-paragraph`, [src/shared/unsupported-block-cases.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/unsupported-block-cases.ts:126) `SE3 horizontalLine default` | [tests/fixtures/samples/se3-quote-table-vita/source.html](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/source.html:559) `div.se_component.se_horizontalLine.default` | [sekishin-221290869775-se3-horizontal-line-default-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-default/sekishin-221290869775-se3-horizontal-line-default-capture.json:18) `expected.md:15` 기록 | [unsupported-block-render-resolution-evidence/index.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/index.json:108), [sekishin-221290869775-se3-horizontal-line-default-options.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-default/sekishin-221290869775-se3-horizontal-line-default-options.md:1) |
| `se3-horizontal-line-line5` | [src/shared/sample-corpus.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/sample-corpus.ts:287) `se3-quote-table-vita` | [src/shared/parser-capabilities.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/parser-capabilities.ts:36) `se3-paragraph`, [src/shared/unsupported-block-cases.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/unsupported-block-cases.ts:185) `SE3 horizontalLine line5` | [tests/fixtures/samples/se3-quote-table-vita/source.html](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/source.html:1482) `div.se_component.se_horizontalLine.line5` | [sekishin-221290869775-se3-horizontal-line-line5-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-line5/sekishin-221290869775-se3-horizontal-line-line5-capture.json:18) `expected.md:16` 기록 | [unsupported-block-render-resolution-evidence/index.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/index.json:116), [sekishin-221290869775-se3-horizontal-line-line5-options.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-line5/sekishin-221290869775-se3-horizontal-line-line5-options.md:1) |
| `se3-oglink-og_bSize` | [src/shared/sample-corpus.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/sample-corpus.ts:287) `se3-quote-table-vita` | [src/shared/parser-capabilities.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/parser-capabilities.ts:42) `se3-paragraph`, [src/shared/unsupported-block-cases.ts](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/src/shared/unsupported-block-cases.ts:244) `SE3 oglink og_bSize` | [tests/fixtures/samples/se3-quote-table-vita/source.html](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/source.html:1625) `div.se_component.se_oglink.og_bSize` | [sekishin-221290869775-se3-oglink-og_bSize-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-oglink-og_bSize/sekishin-221290869775-se3-oglink-og_bSize-capture.json:18) `expected.md:17` 기록 | [unsupported-block-render-resolution-evidence/index.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/index.json:124), [sekishin-221290869775-se3-oglink-og_bSize-options.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-oglink-og_bSize/sekishin-221290869775-se3-oglink-og_bSize-options.md:1) |

- baseline warning 총합은 `4`건이다.
- source block 총합도 `4`건이다.
- 이후 corpus에 같은 warning 문자열이 늘어나더라도 식별 키가 다르면 새 조합으로 분리한다.

## 대표 사례 선정 기준

- 대표 사례 키는 `editorVersion + top-level tag/class 시그니처 + 렌더를 바꾸는 child structure + 텍스트 유무`로 잡는다.
- class 이름이 같아도 size token, style token, 썸네일 존재 여부처럼 실제 네이버 렌더 차이를 만들 수 있는 속성이 다르면 다른 조합으로 분리한다.
- 스크립트 훅, lazy loader, 클릭 핸들러처럼 본문 DOM이 아닌 후처리 코드는 대표 사례 키에서 제외한다.
- 같은 조합이 여러 번 나오면 `expected.md`에 warning이 실제로 재현되고, fixture에서 원본 DOM과 주변 문맥을 함께 읽기 쉬운 사례를 대표로 고른다.
- 같은 조합이 여러 sample에 걸쳐 나오면 `sample-corpus`에 먼저 등록된 sample을 대표로 잡고, 나머지는 같은 키에 매핑해 재사용한다.

## 조합 분류

| 식별자 | sampleId | 현재 warning | 원본 block 시그니처 | 렌더 영향 속성 | 판별 기준 |
| --- | --- | --- | --- | --- | --- |
| `se2-inline-gif-video` | `se2-table-rawhtml-navigation` | `SE2 블록을 해석하지 못해 raw HTML로 남겼습니다: <p>` | `p > video.fx._postImage._gifmp4[data-gif-url]` | `video` 존재, `data-gif-url` 존재, 문단 텍스트 없음 | `p` 태그 안에 실제 텍스트 없이 `video`만 있고, 그 `video`가 `_gifmp4`와 `data-gif-url`을 같이 가지면 이 조합으로 본다. 일반 텍스트 문단, 이미지 문단, oglink wrapper는 제외한다. |
| `se3-horizontal-line-default` | `se3-quote-table-vita` | `SE3 블록을 구조화하지 못해 텍스트로 변환했습니다: se_component se_horizontalLine default` | `div.se_component.se_horizontalLine.default` | 수평선 block, 스타일 토큰 `default` | 최상위 class에 `se_horizontalLine`과 `default`가 같이 있으면 이 조합으로 본다. 내부 구조는 `se_horizontalLineView > .se_hr > hr` 기준으로 동일해도, style 토큰이 `default`면 `line5`와 합치지 않는다. |
| `se3-horizontal-line-line5` | `se3-quote-table-vita` | `SE3 블록을 구조화하지 못해 텍스트로 변환했습니다: se_component se_horizontalLine line5` | `div.se_component.se_horizontalLine.line5` | 수평선 block, 스타일 토큰 `line5` | 최상위 class에 `se_horizontalLine`과 `line5`가 같이 있으면 이 조합으로 본다. 내부 `hr` 구조가 같아도 class token이 다르면 실제 네이버 라인 스타일이 달라질 수 있으므로 별도 케이스로 유지한다. |
| `se3-oglink-og_bSize` | `se3-quote-table-vita` | `SE3 블록을 구조화하지 못해 텍스트로 변환했습니다: se_component se_oglink og_bSize` | `div.se_component.se_oglink.og_bSize > .se_og_wrap > a.se_og_box` | 카드 크기 토큰 `og_bSize`, 썸네일 유무, title/desc/cp 3단 텍스트 | 최상위 class에 `se_oglink`와 `og_bSize`가 같이 있고, 내부에 `se_og_thumb`, `se_og_tit`, `se_og_desc`, `se_og_cp`가 모두 있으면 이 조합으로 본다. 썸네일 없는 oglink, video oglink, 다른 size token은 재사용 대상이 아니라 새 조합 후보로 분리한다. |

## corpus 근거

| 식별자 | 대표 fixture 근거 | 대표 선정 이유 |
| --- | --- | --- |
| `se2-inline-gif-video` | [tests/fixtures/samples/se2-table-rawhtml-navigation/source.html](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se2-table-rawhtml-navigation/source.html:312), [mym0404-221459172607-se2-inline-gif-video-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se2-inline-gif-video/mym0404-221459172607-se2-inline-gif-video-capture.json:18) | baseline에서 warning이 발생했던 SE2 rawHtml fallback sample은 이 sample 1건이다. 문제 block 바로 뒤에 oglink가 이어져 있어서, 이후 후보안 설계 때 `gif mp4`와 일반 링크 카드가 섞이지 않는지도 같이 판단할 수 있다. |
| `se3-horizontal-line-default` | [tests/fixtures/samples/se3-quote-table-vita/source.html](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/source.html:559), [sekishin-221290869775-se3-horizontal-line-default-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-default/sekishin-221290869775-se3-horizontal-line-default-capture.json:18) | baseline 전체에서 `se_horizontalLine default` warning은 이 1건만 재현됐다. `line5`와 DOM 뼈대는 같지만 class token만 다르므로 비교 기준점으로 적합하다. |
| `se3-horizontal-line-line5` | [tests/fixtures/samples/se3-quote-table-vita/source.html](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/source.html:1482), [sekishin-221290869775-se3-horizontal-line-line5-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-line5/sekishin-221290869775-se3-horizontal-line-line5-capture.json:18) | baseline 전체에서 `se_horizontalLine line5` warning도 이 1건뿐이었다. `default`와 쌍으로 있어, 이후 실제 렌더 비교에서 style token 차이를 바로 대조하기 좋다. |
| `se3-oglink-og_bSize` | [tests/fixtures/samples/se3-quote-table-vita/source.html](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/tests/fixtures/samples/se3-quote-table-vita/source.html:1625), [sekishin-221290869775-se3-oglink-og_bSize-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-oglink-og_bSize/sekishin-221290869775-se3-oglink-og_bSize-capture.json:18) | baseline 전체에서 `og_bSize` warning은 이 1건만 재현됐다. 썸네일, 제목, 설명, 출처가 모두 들어 있어 후보안 비교에 필요한 정보가 가장 완전하다. |

## 증적 파일 규칙

- 진행 중 증적 루트는 저장소 루트의 `unsupported-block-render-resolution-evidence/`로 고정한다.
- 작업이 끝나 큰 변경을 닫을 때만 [.agents/knowledge/reference/plan-archive/index.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/.agents/knowledge/reference/plan-archive/index.md:12) 규칙에 따라 `.agents/knowledge/reference/plan-archive/unsupported-block-render-resolution/evidence/`로 옮긴다.
- 대표 사례별 파일명 stem은 `<blogId>-<logNo>-<caseId>` 형식으로 고정한다.
- 대표 사례별 증적 파일은 같은 stem을 유지한 채 `-block.png`, `-context.png`, `-options.md` suffix만 붙인다.
- 진행 중 경로와 완료 후 경로는 루트만 다르고, `caseId/파일명` 상대 경로는 바꾸지 않는다.

| 식별자 | 증적 stem | 진행 중 저장 경로 규칙 | 완료 후 저장 경로 규칙 |
| --- | --- | --- | --- |
| `se2-inline-gif-video` | `mym0404-221459172607-se2-inline-gif-video` | `unsupported-block-render-resolution-evidence/se2-inline-gif-video/mym0404-221459172607-se2-inline-gif-video-{block,context}.png`, `unsupported-block-render-resolution-evidence/se2-inline-gif-video/mym0404-221459172607-se2-inline-gif-video-options.md` | `.agents/knowledge/reference/plan-archive/unsupported-block-render-resolution/evidence/se2-inline-gif-video/mym0404-221459172607-se2-inline-gif-video-{block,context}.png`, `.agents/knowledge/reference/plan-archive/unsupported-block-render-resolution/evidence/se2-inline-gif-video/mym0404-221459172607-se2-inline-gif-video-options.md` |
| `se3-horizontal-line-default` | `sekishin-221290869775-se3-horizontal-line-default` | `unsupported-block-render-resolution-evidence/se3-horizontal-line-default/sekishin-221290869775-se3-horizontal-line-default-{block,context}.png`, `unsupported-block-render-resolution-evidence/se3-horizontal-line-default/sekishin-221290869775-se3-horizontal-line-default-options.md` | `.agents/knowledge/reference/plan-archive/unsupported-block-render-resolution/evidence/se3-horizontal-line-default/sekishin-221290869775-se3-horizontal-line-default-{block,context}.png`, `.agents/knowledge/reference/plan-archive/unsupported-block-render-resolution/evidence/se3-horizontal-line-default/sekishin-221290869775-se3-horizontal-line-default-options.md` |
| `se3-horizontal-line-line5` | `sekishin-221290869775-se3-horizontal-line-line5` | `unsupported-block-render-resolution-evidence/se3-horizontal-line-line5/sekishin-221290869775-se3-horizontal-line-line5-{block,context}.png`, `unsupported-block-render-resolution-evidence/se3-horizontal-line-line5/sekishin-221290869775-se3-horizontal-line-line5-options.md` | `.agents/knowledge/reference/plan-archive/unsupported-block-render-resolution/evidence/se3-horizontal-line-line5/sekishin-221290869775-se3-horizontal-line-line5-{block,context}.png`, `.agents/knowledge/reference/plan-archive/unsupported-block-render-resolution/evidence/se3-horizontal-line-line5/sekishin-221290869775-se3-horizontal-line-line5-options.md` |
| `se3-oglink-og_bSize` | `sekishin-221290869775-se3-oglink-og_bSize` | `unsupported-block-render-resolution-evidence/se3-oglink-og_bSize/sekishin-221290869775-se3-oglink-og_bSize-{block,context}.png`, `unsupported-block-render-resolution-evidence/se3-oglink-og_bSize/sekishin-221290869775-se3-oglink-og_bSize-options.md` | `.agents/knowledge/reference/plan-archive/unsupported-block-render-resolution/evidence/se3-oglink-og_bSize/sekishin-221290869775-se3-oglink-og_bSize-{block,context}.png`, `.agents/knowledge/reference/plan-archive/unsupported-block-render-resolution/evidence/se3-oglink-og_bSize/sekishin-221290869775-se3-oglink-og_bSize-options.md` |

## 재사용 규칙

- 같은 block type이어도 렌더를 바꾸는 class token이나 child structure가 다르면 같은 조합으로 묶지 않는다.
- 이번 corpus에서 전역 재사용 가능한 키는 `tag/class 시그니처 + 핵심 child 존재 여부 + 텍스트 유무`까지다.
- `se2-inline-gif-video`는 `p + video._gifmp4 + no-text` 조합에만 재사용한다.
- `se3-horizontal-line-default`는 `se_horizontalLine + default` 조합에만 재사용한다.
- `se3-horizontal-line-line5`는 `se_horizontalLine + line5` 조합에만 재사용한다.
- `se3-oglink-og_bSize`는 `se_oglink + og_bSize + thumb/title/desc/cp` 조합에만 재사용한다.

## 원본 렌더 근거

| 식별자 | 원본 렌더 근거 | 현재 확보 상태 | 렌더 핵심 해석 |
| --- | --- | --- | --- |
| `se2-inline-gif-video` | [mym0404-221459172607-se2-inline-gif-video-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se2-inline-gif-video/mym0404-221459172607-se2-inline-gif-video-capture.json:1), [mym0404-221459172607-se2-inline-gif-video-options.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se2-inline-gif-video/mym0404-221459172607-se2-inline-gif-video-options.md:1) | `block/context PNG` 없음, source URL·selector·앵커·옵션 메모 확보 | 텍스트 없이 GIF처럼 자동 재생되는 인라인 media다. 시각 정보는 `poster`, 실제 재생 대상은 mp4 `src`에 걸린다. |
| `se3-horizontal-line-default` | [sekishin-221290869775-se3-horizontal-line-default-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-default/sekishin-221290869775-se3-horizontal-line-default-capture.json:1), [sekishin-221290869775-se3-horizontal-line-default-options.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-default/sekishin-221290869775-se3-horizontal-line-default-options.md:1) | `block/context PNG` 없음, source URL·selector·앵커·옵션 메모 확보 | 텍스트 없는 기본형 가는 구분선이다. 의미는 divider이고 차이는 style token `default`에만 있다. |
| `se3-horizontal-line-line5` | [sekishin-221290869775-se3-horizontal-line-line5-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-line5/sekishin-221290869775-se3-horizontal-line-line5-capture.json:1), [sekishin-221290869775-se3-horizontal-line-line5-options.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-line5/sekishin-221290869775-se3-horizontal-line-line5-options.md:1) | `block/context PNG` 없음, source URL·selector·앵커·옵션 메모 확보 | DOM은 `default`와 같지만 시각 차이를 만드는 token이 `line5`다. block type은 같아도 style 차이를 따로 다뤄야 한다. |
| `se3-oglink-og_bSize` | [sekishin-221290869775-se3-oglink-og_bSize-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-oglink-og_bSize/sekishin-221290869775-se3-oglink-og_bSize-capture.json:1), [sekishin-221290869775-se3-oglink-og_bSize-options.md](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-oglink-og_bSize/sekishin-221290869775-se3-oglink-og_bSize-options.md:1) | `block/context PNG` 없음, source URL·selector·앵커·옵션 메모 확보 | 썸네일, 제목, 설명, 출처가 한 anchor 카드로 결합된 큰 oglink다. 핵심은 메타가 한 덩어리로 묶인다는 점이다. |

## 후보안 비교표

### `se2-inline-gif-video`

| 후보안 | 출력 형태 | 장점 | 보존 요소 | 손실 요소 |
| --- | --- | --- | --- | --- |
| `linked-poster-image` | `[![](poster)](mp4)` | 정적 Markdown에서도 시각 밀도와 원본 진입점을 함께 남긴다. 실제 렌더의 "보이는 것은 이미지, 클릭하면 재생" 감각과 가장 가깝다. | 포스터 이미지, 블록 존재감, 원본 mp4 접근 경로 | 자동 재생, 움직임 자체 |
| `poster-image-only` | `![](poster)` | 가장 단순하고 대부분의 렌더러에서 안정적이다. | 포스터 이미지, 본문 리듬 | 원본 mp4 링크, 움직임 |
| `source-link-only` | `[GIF video](mp4)` | 자산 의존이 없어 가장 안전하다. | mp4 원본 URL | 포스터 이미지, 시각 밀도, GIF처럼 보이는 체감 |

- 원본 렌더 근거: `video.fx._postImage._gifmp4[data-gif-url]` 단독 block이고 앞뒤 앵커가 [mym0404-221459172607-se2-inline-gif-video-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se2-inline-gif-video/mym0404-221459172607-se2-inline-gif-video-capture.json:1)에 고정돼 있다.
- 비교 판단: 이 사례는 텍스트보다 media 존재감이 중요해서 링크만 남기는 안보다 포스터 기반 안이 더 적합하다.

### `se3-horizontal-line-default`

| 후보안 | 출력 형태 | 장점 | 보존 요소 | 손실 요소 |
| --- | --- | --- | --- | --- |
| `markdown-hr` | `---` | Markdown 호환성이 가장 높고 구현이 단순하다. | divider 의미, 문단 분리 | `default` 스타일 token |
| `asterisk-hr` | `***` | `---`보다 시각 분리가 조금 더 강하다. | divider 의미 | 실제 `default` 라인 느낌, style token |
| `html-default-hr` | `<hr data-style="default">` | `default` token을 그대로 남겨 후단 HTML 렌더에서 원형에 가깝게 다룰 수 있다. | divider 의미, style token, 후단 확장 여지 | 순수 Markdown 호환성 |

- 원본 렌더 근거: [sekishin-221290869775-se3-horizontal-line-default-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-default/sekishin-221290869775-se3-horizontal-line-default-capture.json:1)에 `div.se_component.se_horizontalLine.default`와 앞뒤 문맥이 고정돼 있다.
- 비교 판단: `default`는 의미보다 호환성이 더 중요해 보여 Markdown divider를 우선 후보로 둔다.

### `se3-horizontal-line-line5`

| 후보안 | 출력 형태 | 장점 | 보존 요소 | 손실 요소 |
| --- | --- | --- | --- | --- |
| `html-line5-hr` | `<hr data-style="line5">` | `default`와 다른 style token을 그대로 남겨 같은 block type 안의 차이를 유지한다. | divider 의미, `line5` token, 후단 확장 여지 | 순수 Markdown 호환성 |
| `markdown-hr` | `---` | 구현이 가장 단순하고 범용적이다. | divider 의미 | `default`와 구분되는 style 차이 |
| `asterisk-hr` | `***` | `line5`를 더 강한 구분선으로 해석할 수 있다. | divider 의미, 상대적으로 강한 분리감 | 실제 `line5` token, 원형 스타일 근거 |

- 원본 렌더 근거: [sekishin-221290869775-se3-horizontal-line-line5-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-horizontal-line-line5/sekishin-221290869775-se3-horizontal-line-line5-capture.json:1)에 `div.se_component.se_horizontalLine.line5`와 앞뒤 문맥이 고정돼 있다.
- 비교 판단: 이 사례는 `default`와 구분되는 token 보존이 핵심이라 HTML 안이 우선 후보가 된다.

### `se3-oglink-og_bSize`

| 후보안 | 출력 형태 | 장점 | 보존 요소 | 손실 요소 |
| --- | --- | --- | --- | --- |
| `rich-html-card` | 썸네일·제목·설명·출처를 묶은 anchor 카드 HTML | 실제 네이버 카드 구조와 결속감을 가장 잘 유지한다. | 썸네일, 제목, 설명, 출처, 카드 결속, 단일 클릭 영역 | 순수 Markdown 호환성 |
| `markdown-image-summary` | 썸네일 링크 + 제목 링크 + 설명 + 출처 문단 | Markdown 친화적이면서 핵심 정보는 대부분 유지한다. | 썸네일, 제목, 설명, 출처, 원본 URL | 카드형 단일 클릭 영역, 메타 결속감 |
| `title-link-only` | 제목 링크 1줄 | 가장 짧고 안전하다. | 제목, 원본 URL | 썸네일, 설명, 출처, 카드 구조 |

- 원본 렌더 근거: [sekishin-221290869775-se3-oglink-og_bSize-capture.json](/Users/mj/.ouroboros/worktrees/farewell-naver-blog/orch_582832f19942/unsupported-block-render-resolution-evidence/se3-oglink-og_bSize/sekishin-221290869775-se3-oglink-og_bSize-capture.json:1)에 `div.se_component.se_oglink.og_bSize`와 앞뒤 문맥이 고정돼 있다.
- 비교 판단: 이 사례는 정보량보다 "한 덩어리 카드" 구조가 핵심이라 HTML 카드 안이 원형 충실도가 가장 높다.

## 비교표 결론

| 식별자 | 원형 충실도 우선안 | 호환성 우선안 | 핵심 쟁점 |
| --- | --- | --- | --- |
| `se2-inline-gif-video` | `linked-poster-image` | `source-link-only` | 움직임 손실을 어디까지 감수할지 |
| `se3-horizontal-line-default` | `html-default-hr` | `markdown-hr` | style token 보존보다 Markdown 호환성을 더 볼지 |
| `se3-horizontal-line-line5` | `html-line5-hr` | `markdown-hr` | `default`와의 차이를 남길지 |
| `se3-oglink-og_bSize` | `rich-html-card` | `markdown-image-summary` | 카드 결속을 유지할지, Markdown 친화성을 택할지 |
