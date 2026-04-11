# UI Dashboard Design System

## 목적
정적 UI를 `Admindek` 계열의 밝은 분석 대시보드로 유지하기 위한 기준 문서다.

## Source Of Truth
- 구조: `src/static/index.html`
- 시각 토큰과 컴포넌트 규칙: `src/static/styles.css`
- 상태 렌더링과 frontmatter 상호작용: `src/static/app.js`
- 수동 검증 절차: `docs/runbooks/browser-verification.md`

## 관련 코드
- [../../../src/static/index.html](../../../src/static/index.html)
- [../../../src/static/styles.css](../../../src/static/styles.css)
- [../../../src/static/app.js](../../../src/static/app.js)
- [../../../docs/runbooks/browser-verification.md](../../../docs/runbooks/browser-verification.md)

## 검증 방법
- `pnpm check:quick`
- `pnpm smoke:ui`

## Style Direction
- 메인 캔버스는 밝은 회백색, 좌측 사이드바는 진한 네이비 톤을 사용한다.
- 상단은 얇은 utility bar와 scan workbench로 구성한다.
- KPI strip은 컬러 카드 4장으로 고정한다.
- 본문은 흰색 카드 기반의 분석 보드로 구성하고, status와 logs도 별도 rail이 아니라 같은 보드 안에 둔다.
- export 전에는 현재 선택 범위의 대표 글을 기준으로 예시 Markdown preview를 먼저 확인한다.

## Tokens
- Page background: `#EEF3F9`, `#E5EDF6`
- Sidebar: `#253447`, `#1D2938`
- Surface: `#FFFFFF`, `#F7F9FC`, `#F2F6FB`
- Border: `#DCE5F0`, `#C8D5E4`
- Text: `#243244`, `#17212F`
- Muted text: `#708299`
- Primary: `#4D7AF7`
- Accent cyan: `#1BC7DE`
- Accent green: `#48B74D`
- Warning: `#F2B544`
- Danger: `#E95F76`

## Typography
- 기본 UI와 본문은 `Public Sans`
- KPI 숫자, 상태 배지, 로그는 `IBM Plex Mono`
- 본문 최소 크기는 16px, line-height는 1.6 이상 유지한다.
- 숫자형 데이터는 mono 계열과 tabular한 인상을 우선한다.

## Layout
- 기본 구조는 `left sidebar + topbar/workbench + KPI strip + content board`다.
- 데스크톱은 `272px sidebar + fluid main` 구조를 유지한다.
- `1080px` 이하에서는 sidebar를 상단 블록으로 접는다.
- `900px` 이하에서는 scan toolbar, control bar, status layout, frontmatter row를 1열로 접는다.
- 모바일에서 가로 스크롤은 허용하지 않는다.

## Component Rules
- primary action은 파란 버튼 한 계층으로 둔다.
- secondary action은 밝은 배경의 ghost button만 사용한다.
- `scan-status`, `status-text`는 pill 형태를 유지하되 상태별 색만 달라진다.
- category row는 `checkbox + subtle left guide + meta + count pill` 구조를 유지한다.
- option group은 밝은 카드와 얇은 border를 공유한다.
- preview panel은 candidate post 요약과 Markdown preformatted block을 함께 보여준다.
- frontmatter row는 `toggle + description + alias input` 묶음으로 항상 노출한다.
- frontmatter alias 오류는 상단 상태 배너와 행 border 강조를 동시에 사용한다.
- logs panel은 진한 콘솔 배경을 사용하되 외곽 카드 시스템은 본문과 동일하게 맞춘다.
- export 결과 본문에는 raw HTML을 남기지 않는다. HTML fallback은 생략 또는 best-effort Markdown 변환으로 처리한다.

## Accessibility
- 텍스트 대비는 밝은 표면 기준 4.5:1 이상을 유지한다.
- focus ring은 파란 계열 4px halo를 공통으로 사용한다.
- 버튼과 주요 입력의 높이는 48px 이상 유지한다.
- frontmatter, category, export 상태는 색만이 아니라 텍스트와 border 변화로도 구분한다.
- `prefers-reduced-motion`에서는 transition과 animation을 제거한다.

## Motion
- 상호작용 transition은 `180ms` 또는 `260ms`만 사용한다.
- hover는 이동보다 border와 shadow 변화를 우선한다.
- expanded/collapsed chevron 회전만 허용하고 과한 enter animation은 넣지 않는다.

## Anti-Patterns
- hero 중심의 큰 헤더 재도입 금지
- 우측 sticky status rail 재도입 금지
- dark glass panel을 본문 카드 기본값으로 사용하는 것 금지
- frontmatter 설명을 숨기거나 접힘 안으로 넣는 것 금지
- status/logs를 본문과 다른 시각 언어로 분리하는 것 금지

## Screenshot Review Checklist
- 좌측 사이드바, 상단 툴바, KPI strip의 정렬이 맞는지
- KPI 카드의 숫자 가독성과 대비가 충분한지
- category row와 frontmatter row가 과밀하지 않은지
- disabled, focus, error, selected 상태가 바로 보이는지
- 모바일 375px에서 한 컬럼으로 자연스럽게 접히는지
- logs panel과 summary 카드가 같은 대시보드 계층 안에서 읽히는지
