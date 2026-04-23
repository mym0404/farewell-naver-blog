# se3-horizontal-line-default

## Capture

- `captureId`: `se3-quote-table-vita__se3-horizontal-line-default`
- `status`: `pending-capture`
- `blockImage`: `sekishin-221290869775-se3-horizontal-line-default-block.png`
- `contextImage`: `sekishin-221290869775-se3-horizontal-line-default-context.png`

## Trace

- `source`: `https://m.blog.naver.com/sekishin/221290869775`
- `selector`: `div.se_component.se_horizontalLine.default`
- `previousTextAnchor`: `안녕하세요. 게임최고 RedSoul입니다.`
- `nextTextAnchor`: `이 게임은...`

## Options

- 렌더 요약: 텍스트 없이 얇은 기본형 수평선만 보이는 block이다.
- 추천안 `markdown-hr`: `---`로 단순화해 대부분의 Markdown 렌더러에서 안정적으로 재현한다.
- 후보안 `asterisk-hr`: `***`로 같은 의미를 유지하되 더 강한 시각 분리를 준다.
- 후보안 `html-default-hr`: `<hr data-naver-block="se3-horizontal-line" data-style="default">`로 style token을 보존한다.

## 합의 기록

- 최종 선택안: `markdown-hr`
- 선택 사유: `default`는 스타일 토큰보다 범용 구분선 의미가 더 중요해서 Markdown 호환성을 우선한다.
- 예외 규칙: `line5`나 다른 style token에는 이 결론을 재사용하지 않는다.
