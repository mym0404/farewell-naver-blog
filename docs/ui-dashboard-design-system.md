# UI Dashboard Design System

## 목적
이 문서는 정적 웹 UI의 다크 우선 대시보드 리뉴얼에서 사용하는 시각 토큰과 컴포넌트 원칙을 짧게 고정한다.

## Source Of Truth
실제 토큰과 컴포넌트 규칙은 `src/static/styles.css`, 구조는 `src/static/index.html`, 상태 렌더링은 `src/static/app.js`가 기준이다.

## 관련 코드
- [../src/static/index.html](../src/static/index.html)
- [../src/static/styles.css](../src/static/styles.css)
- [../src/static/app.js](../src/static/app.js)
- [./runbooks/browser-verification.md](./runbooks/browser-verification.md)

## 검증 방법
- `pnpm check:quick`
- `pnpm smoke:ui`

## Tokens
- 배경: `#020617`, `#081122`
- 표면: `#0E1223`, `#131A30`, `#1A1E2F`
- 경계선: `#334155`, 반투명 border variants
- 본문 텍스트: `#F8FAFC`
- 보조 텍스트: `#94A3B8`
- 주요 액션: `#2563EB`
- 성공/정상 상태: `#22C55E`
- 위험 상태: `#EF4444`

## Typography
- 기본 UI와 본문은 `Fira Sans`
- 수치, 상태, 작은 라벨은 `Fira Code`
- 본문은 16px 이상, line-height 1.6 이상 유지
- KPI와 로그는 tabular, mono 성격을 우선한다

## Layout
- 기본 구조는 `header dashboard + main workspace + sticky status rail`
- 데스크톱은 2열, 모바일은 단일 컬럼으로 접는다
- 간격은 4/8 기반 스케일을 유지한다
- 카테고리 목록과 옵션 그룹은 카드 경계와 상태 대비로 구분한다

## Component Rules
- 버튼은 primary/ghost 두 계층만 사용한다
- input/select는 동일한 반경, border, focus ring을 사용한다
- 상태 요약은 KPI 카드 + note banner 조합으로 표현한다
- 로그는 별도 mono panel로 분리한다
- 선택 가능한 카테고리 행은 checked 상태가 배경/경계선으로 드러나야 한다
- frontmatter 행은 field toggle, 설명, alias 입력을 한 묶음으로 보여준다
- frontmatter alias 오류는 필드 묶음 상단 상태 배너에서 즉시 보여주고 export 액션과 연결한다

## Motion
- transition은 180ms 또는 260ms만 사용한다
- hover/pressed/focus는 의미 있는 상태 변화만 준다
- `prefers-reduced-motion`에서는 transition과 animation을 제거한다

## Anti-Patterns
- pure black 배경 사용 금지
- 강조색을 여러 계열로 섞는 것 금지
- 구조 설명을 UI 카피로 노출하는 것 금지
- hover 없이 구분 안 되는 인터랙션 금지
- 상태 패널과 작업 패널의 위계를 비슷하게 만들어 시선이 분산되는 배치 금지
