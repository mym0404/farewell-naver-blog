# se2-inline-gif-video

## Capture

- `captureId`: `se2-table-rawhtml-navigation__se2-inline-gif-video`
- `status`: `pending-capture`
- `blockImage`: `mym0404-221459172607-se2-inline-gif-video-block.png`
- `contextImage`: `mym0404-221459172607-se2-inline-gif-video-context.png`

## Trace

- `source`: `https://m.blog.naver.com/mym0404/221459172607`
- `selector`: `p > video.fx._postImage._gifmp4[data-gif-url]`
- `previousTextAnchor`: `결과물을 보자!`
- `nextTextAnchor`: `Navigation | Android Developers`

## Options

- 렌더 요약: 텍스트 없는 인라인 GIF처럼 보이고, 실제 DOM은 `poster` 대체용 `data-gif-url`과 autoplay용 mp4 `src`를 함께 가진다.
- 추천안 `linked-poster-image`: `[![](poster)](mp4)` 형태로 정지 포스터를 보여주고 클릭 시 mp4 원본으로 이동한다.
- 후보안 `poster-image-only`: `![](poster)`만 남겨 시각 정보는 유지하고 움직임은 포기한다.
- 후보안 `source-link-only`: `[GIF video](mp4)` 링크만 남겨 자산 의존을 없앤다.

## 합의 기록

- 최종 선택안: `linked-poster-image`
- 선택 사유: 실제 렌더의 첫인상이 포스터 이미지 중심이고, 클릭 시 mp4로 이어지는 원본 진입점도 같이 보존해야 한다.
- 예외 규칙: `posterUrl`이 없으면 `source-link-only`로 낮춘다. 텍스트가 섞인 문단이나 일반 비디오 블록에는 이 결론을 재사용하지 않는다.
