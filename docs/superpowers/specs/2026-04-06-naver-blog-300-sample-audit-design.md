# Naver Blog 300 Sample Audit Design

## 목적
- 공개 네이버 블로그 글 300건을 직접 판독해 parser, renderer, output option, test 개선의 근거를 수집한다.
- 이번 단계의 완료 기준은 코드 수정이 아니라 조사 완료와 구조화된 기록이다.
- 각 조사 항목마다 의도한 Markdown output이 나오는지 확인하고, 기대와 다르면 원인과 증상을 기록한다.

## 범위
- 로그인 없이 접근 가능한 공개 네이버 블로그 글만 조사 대상에 포함한다.
- 서로 다른 블로그를 최대한 넓게 섞어 300건을 채운다.
- 에디터 버전과 블록 유형 다양성을 우선해 샘플을 선정한다.
- 조사 결과는 단일 진행 문서 1개에서 관리한다.

## 비범위
- 조사 도중 parser, renderer, exporter, test를 바로 수정하지 않는다.
- 비공개 글, 접근 제한 글, 네이버 블로그 외 플랫폼은 포함하지 않는다.
- 이번 단계 완료 기준에 typecheck, test 통과, docs/harness 갱신을 포함하지 않는다.

## 선행 준비물
- 300건 조사 전에 특정 글 1건을 바로 Markdown으로 변환하고 결과를 확인할 수 있는 단건 검증 워크플로가 준비되어 있어야 한다.
- 이 워크플로는 조사 도중 반복 실행해도 부담이 낮아야 한다.
- dev server 의존 없이 직접 실행 가능해야 한다.

## 운영 원칙
1. 조사와 개선을 분리한다.
2. 진행 상태는 단일 마크다운 문서에서 관리한다.
3. 각 기록은 나중에 코드, fixture, sample corpus, docs로 옮길 수 있는 근거여야 한다.
4. 샘플 선정은 주제가 아니라 editor version과 block coverage를 기준으로 한다.
5. 동일 구조가 반복되면 중복성을 낮게 평가하고 더 다양한 구조를 우선한다.
6. 본문 구조 판독만으로 끝내지 않고, 실제 Markdown 변환 결과가 의도대로 나오는지 함께 확인한다.
7. 예상치 못한 converting 오류, 예외, 손실, 왜곡은 재현 가능한 형태로 남긴다.

## 조사 대상 선정 규칙
### 접근 조건
- 브라우저에서 로그인 없이 열리는 공개 글만 유효하다.
- 접근 불가, 비공개, 서로이웃 전용, 삭제된 글은 제외 상태로 기록한다.

### 다양성 조건
- 가능한 한 서로 다른 블로그를 우선한다.
- 한 블로그 재사용은 특정 editor version 또는 block 조합의 공백을 메우는 경우에만 허용한다.

### 우선순위
- SE2, SE3, SE4 분포를 가능한 넓게 확보한다.
- 텍스트 위주 글보다 구조가 복잡한 글을 우선한다.
- 이미지, 이미지 그룹, 표, 인용, 코드, 수식, 링크 카드, 비디오, raw HTML 가능성이 보이는 글을 우선한다.

## 판독 절차
1. 후보 URL을 연다.
2. 공개 접근 가능 여부를 확인한다.
3. editor version을 추정하거나 확인한다.
4. 눈에 보이는 주요 block type과 조합을 기록한다.
5. 해당 글이 의도한 Markdown output으로 변환되는지 확인한다.
6. output이 기대와 다르면 누락, 왜곡, fallback, formatting 붕괴, 구조 손실 원인을 기록한다.
7. 현재 parser catalog에 없는 변형 또는 혼합 구조가 있는지 기록한다.
8. 후속 개선 태그를 분류한다.
9. 진행 문서 한 행을 갱신한다.

## 브라우저 사용 원칙
- 실제 판독은 `browser-use`로 수행한다.
- 한 번에 한 글씩 열고 수동으로 구조를 확인한다.
- 대량 자동 스크래핑보다 판독 가능한 증거 기록을 우선한다.

## 단건 검증 워크플로 요구사항
조사 과정에서 특정 글을 읽은 직후 바로 검증할 수 있도록 `blogId + logNo` 기반 단건 변환 경로를 제공해야 한다.

### 목표
- 특정 글 1건을 즉시 fetch -> parse -> review -> render -> Markdown 출력까지 확인할 수 있어야 한다.
- 조사 중 발견한 edge case를 같은 맥락에서 바로 재현하고 기록할 수 있어야 한다.

### 입력
- `blogId`
- `logNo`
- 선택적 Markdown/export option override
- 선택적 output 경로 또는 stdout 출력 모드

### 출력
- 렌더링된 Markdown 본문
- 저장 경로 또는 stdout 결과
- editor version
- detected block types
- parser warnings
- reviewer warnings
- render warnings
- 변환 실패 또는 예외 메시지

### 사용 원칙
- 기본 동작은 단건 조사와 기록에 최적화되어야 한다.
- 300건 조사 도중 반복 사용하므로 실행 절차가 짧아야 한다.
- 의도한 Markdown output과 실제 output을 바로 비교할 수 있어야 한다.
- output 불일치가 있으면 원인 기록에 필요한 진단 정보가 함께 제공되어야 한다.

## 진행 문서 구조
진행 문서는 300건 전체를 한 파일에서 관리한다.

### 필수 컬럼
- `seq`
- `status`
- `blogId`
- `logNo`
- `url`
- `editor`
- `observedBlocks`
- `markdownResult`
- `suspectedIssues`
- `notes`
- `followUp`

### 상태 값
- `candidate`
- `reviewed`
- `excluded-duplicate`
- `excluded-inaccessible`
- `followup-needed`

### followUp 태그
- `parse-edge`
- `render-edge`
- `option-gap`
- `test-gap`
- `none`

## 기록 규칙
- `observedBlocks`는 재집계 가능한 짧은 정규화 값으로 기록한다.
- `markdownResult`에는 `as-expected`, `mismatch`, `error`, `not-checked` 중 하나를 기록한다.
- `notes`에는 구조적으로 중요한 사실만 남긴다.
- `suspectedIssues`에는 현재 parser, renderer, output, verification 관점에서 문제 가능성을 짧게 적는다.
- output 불일치가 있으면 왜 기대와 달랐는지, 어느 단계에서 문제가 생겼는지, 어떤 예외 또는 변환 오류가 보였는지 적는다.
- converting 중 예외가 발생하면 증상, 재현 조건, 영향 범위, 관찰 가능한 오류 메시지를 가능한 한 함께 남긴다.
- 코드 수정 아이디어가 떠라도 진행 문서에는 근거만 적고 즉시 구현하지 않는다.

## 300건 완료 기준
- 단일 진행 문서에 300건이 모두 기록되어 있어야 한다.
- 모든 행은 비어 있지 않은 `status`를 가져야 한다.
- 각 행에는 최소 `blogId`, `logNo`, `url`, `editor`, `observedBlocks`, `markdownResult`, `followUp`가 있어야 한다.
- 제외된 항목도 삭제하지 않고 명시적 상태로 남겨야 한다.
- Markdown output 불일치나 converting 오류가 있었던 항목은 원인 또는 관찰 증상이 빠지지 않아야 한다.

## 완료 시 넘길 산출물
300건 조사가 끝나면 진행 문서를 근거로 아래 배치 작업을 설계한다.

1. parser 개선 배치
- `parse-edge` 항목을 editor version별로 묶는다.

2. output option 개선 배치
- `option-gap` 항목을 렌더 정책과 사용자 선택지 기준으로 묶는다.

3. 검증 강화 배치
- `test-gap` 항목을 fixture, sample corpus, integration, harness 보강 후보로 묶는다.

4. renderer 개선 배치
- `render-edge` 항목을 Markdown, HTML fallback, asset/link 표현 기준으로 묶는다.

5. 단건 검증 도구 개선 배치
- 조사 중 반복적으로 드러난 사용성 부족, 진단 정보 부족, 옵션 부족을 정리한다.

## 성공 조건
- 조사 체계가 중간에 흔들리지 않는다.
- 300건 완료 시 coverage 공백과 후속 개선 후보를 문서만 보고 집계할 수 있다.
- 다음 단계 구현 계획이 진행 문서만으로 만들어질 수 있다.
- 조사 중 특정 글을 즉시 Markdown으로 변환해 검증할 수 있는 경로가 준비되어 있다.
