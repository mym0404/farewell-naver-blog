# Unsupported Block Render Resolution Sub-AC 4

## 범위

- AC 3에서 추가한 대표 사례 후보안 선택값에 `사용자 확정` 상태를 따로 분리했다.
- 이번 AC의 목표는 추천안 기본값과 실제 사용자 확정을 구분하고, 대표 사례 4건이 모두 확정되기 전에는 다음 단계로 넘어가지 못하게 만드는 것이다.
- 확정 상태 source of truth는 `ExportOptions.unsupportedBlockCases[caseId]`이며, 사례별 `candidateId`와 `confirmed`를 함께 저장한다.

## 구현 정리

- `src/shared/types.ts`에서 `UnsupportedBlockCaseSelection`에 `confirmed`를 추가했다.
- `src/shared/unsupported-block-cases.ts`에서 기본 추천안은 `confirmed: false`로 두고, 후보 유효성 검사 뒤 확정 상태를 함께 해석하게 바꿨다.
- 같은 파일에 `getUnsupportedBlockCaseConfirmationSummary`를 추가해 `총 사례 수`, `확정 수`, `미확정 caseId`를 한 번에 계산하게 했다.
- `src/ui/features/options/export-options-panel.tsx` markdown step에 확정 요약 alert와 사례별 `이 후보안으로 확정` 버튼을 추가했다.
- 후보를 바꾸면 `confirmed: true 👉 false`로 즉시 되돌아가고, 현재 후보안을 다시 눌러야만 확정된다.
- `src/ui/App.tsx`에서 markdown step 다음 버튼과 diagnostics export 버튼이 미확정 사례가 남아 있으면 비활성화되게 연결했다.
- `scripts/lib/single-post-cli.ts`도 `unsupportedBlockCases.*.confirmed`를 옵션 JSON에서 읽고 검증하게 맞췄다.

## 동작 결과

- 추천안 기본값만으로는 더 이상 `확정`으로 간주되지 않는다.
- 대표 사례 4건은 각각 독립적으로 확정된다.
- 같은 사례에서 후보를 다시 바꾸면 이전 확정은 자동으로 무효화된다.
- 미확정 사례가 1건이라도 남아 있으면 `Markdown 설정 👉 Assets 설정` 이동과 최종 `내보내기`가 막힌다.

## 검증

- `tests/export-options.test.ts`에서 기본 미확정 상태, 유효/무효 후보 병합, persisted `confirmed` 보존을 확인했다.
- `tests/ui/export-options-panel.test.tsx`에서 확정 요약, 사례 카드 확정, 후보 변경 시 확정 해제를 확인했다.
- `tests/ui/app.test.tsx`에서 markdown step 미확정 상태의 다음 버튼 비활성화와 전체 확정 뒤 진행 가능 상태를 확인했다.
- `tests/single-post-cli.test.ts`에서 options JSON의 `confirmed: true` 전달 경로를 확인했다.

## 결론

- 대표 사례별 후보안 선택은 이제 `선택`과 `확정`이 분리된다.
- AC 4 완료 기준인 "각 대표 사례마다 사용자 선택이 확정된다"를 UI/CLI 옵션 모델과 단계 이동 가드까지 포함해 충족했다.
