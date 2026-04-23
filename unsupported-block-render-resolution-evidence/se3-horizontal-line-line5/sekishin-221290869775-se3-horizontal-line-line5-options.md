# se3-horizontal-line-line5

## Capture

- `captureId`: `se3-quote-table-vita__se3-horizontal-line-line5`
- `status`: `pending-capture`
- `blockImage`: `sekishin-221290869775-se3-horizontal-line-line5-block.png`
- `contextImage`: `sekishin-221290869775-se3-horizontal-line-line5-context.png`

## Trace

- `source`: `https://m.blog.naver.com/sekishin/221290869775`
- `selector`: `div.se_component.se_horizontalLine.line5`
- `previousTextAnchor`: `패미통 점수 / 34/40`
- `nextTextAnchor`: `후기`

## Options

- 렌더 요약: DOM 뼈대는 `default`와 같지만 `line5` 스타일 토큰 때문에 별도 관리가 필요한 수평선이다.
- 추천안 `html-line5-hr`: `<hr data-naver-block="se3-horizontal-line" data-style="line5">`로 style token을 직접 남긴다.
- 후보안 `markdown-hr`: `---`로 단순화하지만 `default`와 차이가 사라진다.
- 후보안 `asterisk-hr`: `***`로 조금 더 강한 시각 분리를 주는 대안이다.

## 합의 기록

- 최종 선택안: `html-line5-hr`
- 선택 사유: `default`와 다른 style token을 실제 출력에도 남겨야 같은 block type 안의 차이를 보존할 수 있다.
- 예외 규칙: `styleToken=line5`에만 적용한다. 다른 token이 나오면 새 사례로 분리한다.
