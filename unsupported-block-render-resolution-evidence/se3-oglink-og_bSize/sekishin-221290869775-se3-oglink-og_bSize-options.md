# se3-oglink-og_bSize

## Capture

- `captureId`: `se3-quote-table-vita__se3-oglink-og_bSize`
- `status`: `pending-capture`
- `blockImage`: `sekishin-221290869775-se3-oglink-og_bSize-block.png`
- `contextImage`: `sekishin-221290869775-se3-oglink-og_bSize-context.png`

## Trace

- `source`: `https://m.blog.naver.com/sekishin/221290869775`
- `selector`: `div.se_component.se_oglink.og_bSize`
- `previousTextAnchor`: `이상 리뷰를 마치도록 하겠습니다.`
- `nextTextAnchor`: `[Review PS Vita Part1] 비타는 삶이다 - 소니 PS Vita`

## Options

- 렌더 요약: 썸네일, 제목, 설명, 출처가 하나의 anchor 카드로 묶여 있는 큰 oglink다.
- 추천안 `rich-html-card`: 썸네일 + 제목 + 설명 + 출처를 한 카드 HTML로 유지해 실제 네이버 렌더와 가장 가깝게 맞춘다.
- 후보안 `markdown-image-summary`: 썸네일 링크와 제목 링크, 설명, 출처를 Markdown 문단으로 풀어 쓴다.
- 후보안 `title-link-only`: 제목 링크만 남겨 본문 길이를 최소화한다.

## 합의 기록

- 최종 선택안: `rich-html-card`
- 선택 사유: 실제 렌더 핵심이 메타가 한 anchor 카드로 묶여 있다는 점이라서 카드 결속을 유지하는 안이 가장 적합하다.
- 예외 규칙: `og_bSize`와 `thumb/title/desc/cp` 조합이 모두 있을 때만 재사용한다. 썸네일 유무나 size token이 달라지면 새 사례로 분리한다.
