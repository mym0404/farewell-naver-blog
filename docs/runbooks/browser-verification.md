# Browser Verification Runbook

## 목적
이 문서는 UI smoke 실패 후 수동으로 브라우저에서 확인해야 할 순서를 정리한다.

## Single Post Cross-Check
개별 글의 구조와 Markdown 결과를 비교해야 하면 [single-post-verification.md](./single-post-verification.md)를 따른다.

## Source Of Truth
기본 자동 검증은 `scripts/harness/run-ui-smoke.ts` 이고, 이 문서는 수동 재현 절차를 보완한다.

## 관련 코드
- [../../src/static/index.html](../../src/static/index.html)
- [../../src/static/app.js](../../src/static/app.js)
- [../../.agents/knowledge/product/ui-dashboard-design-system.md](../../.agents/knowledge/product/ui-dashboard-design-system.md)
- [../../src/server/http-server.ts](../../src/server/http-server.ts)
- [../../scripts/harness/run-ui-smoke.ts](../../scripts/harness/run-ui-smoke.ts)

## 검증 방법
- `pnpm smoke:ui`

## Manual Steps
1. 로컬 서버를 띄운다.
2. `mym0404`를 입력하고 scan을 실행한다.
3. `NestJS` 같이 글 수가 작은 카테고리를 검색한다.
4. 선택 카테고리를 하나만 남기고 export를 시작한다.
5. status, summary, logs, manifest 응답을 확인한다.

## Screenshot Feedback Loop
같은 시나리오로 아래 루프를 5번 반복한다.

1. 데스크톱 `1440px` 한 장, 모바일 `375px` 한 장을 캡처한다.
2. 아래 기준으로 어긋남을 적는다.
3. 레이아웃, 간격, 대비, 상태 표현을 수정한다.
4. 다시 같은 시나리오로 캡처한다.

루프마다 확인할 기준:
- 정렬이 어긋나지 않는지
- 모바일 가로 스크롤이 없는지
- focus, disabled, loading 상태가 구분되는지
- 상태 패널과 작업 패널의 시선 우선순위가 충돌하지 않는지
- 로그, 요약, 카테고리 패널이 같은 시각 언어를 유지하는지
- frontmatter alias 충돌 시 오류가 즉시 보이고 export가 막히는지

## What To Record
- scan 실패 여부
- category list 렌더 여부
- export job 완료 여부
- manifest 응답 여부
- UI와 API 상태가 어긋나는지 여부
- 각 스크린샷 루프에서 수정한 시각 불일치 항목
