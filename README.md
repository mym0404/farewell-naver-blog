# farewell-naver-blog

네이버 블로그의 공개 글을 스캔하고, 카테고리와 출력 규칙을 선택한 뒤 Markdown으로 내보내는 로컬 exporter입니다. SE2, SE3, SE4 본문을 공용 AST로 파싱한 다음 GFM, YAML frontmatter, 로컬 자산 파일 구조로 렌더링합니다.

## 무엇을 할 수 있나

- 블로그 ID 또는 URL로 공개 글과 카테고리를 스캔
- 카테고리 단위 export와 하위 카테고리 포함 여부 선택
- 날짜 범위, 폴더 구조, 파일명 규칙, frontmatter 필드, Markdown 렌더링 규칙 조정
- 이미지와 썸네일 다운로드, 상대 경로 자산 관리
- export 결과와 경고를 `manifest.json`으로 기록

## 빠른 시작

### 요구 사항

- Node.js 20+
- pnpm

### 설치

```bash
pnpm install
```

### 실행

```bash
pnpm start
```

브라우저에서 `http://localhost:4173`을 열면 로컬 UI를 사용할 수 있습니다.

## 사용 흐름

1. 블로그 ID 또는 네이버 블로그 URL을 입력합니다.
2. `Scan Categories`로 공개 글 수와 카테고리 목록을 가져옵니다.
3. export 대상 카테고리와 옵션을 선택합니다.
4. 출력 디렉터리를 정한 뒤 export를 실행합니다.
5. 진행 로그와 완료 상태를 확인하고 `manifest.json` 결과를 검토합니다.

## 기본 출력 규약

- 출력 포맷: `GFM + YAML frontmatter + 로컬 이미지 자산`
- 기본 폴더 전략: 카테고리 경로 유지
- 기본 파일명: `YYYY-MM-DD-logNo-slug.md`
- 비디오는 기본적으로 썸네일과 원문 링크로 렌더링
- 단순 표는 GFM, 복잡한 표는 HTML fallback 사용
- raw HTML은 기본적으로 보존

예시 구조:

```text
output/
  posts/
    category-a/
      2024-01-02-1234567890-post-title.md
  assets/
    1234567890/
      image-1.jpg
  manifest.json
```

## 주요 옵션

### Scope

- 카테고리 정확 매칭 또는 하위 카테고리 포함
- 시작일과 종료일 필터

### Structure

- output 디렉터리 초기화 여부
- 글/자산 디렉터리 이름
- 카테고리 경로 유지 또는 flat 구조
- 날짜, `logNo`, slug 규칙

### Frontmatter

- frontmatter 사용 여부
- `title`, `source`, `publishedAt`, `categoryPath`, `warnings` 등 필드별 포함 여부

### Markdown Rules

- 링크 inline/reference
- 링크 카드, 수식, 표, 비디오, 이미지, divider, code fence 스타일
- raw HTML 보존 여부
- heading level offset

### Assets

- 상대 경로 또는 원격 URL 유지
- 본문 이미지 다운로드 여부
- 썸네일 다운로드 여부
- 이미지 캡션 포함 여부
- 썸네일 우선순위 선택

## API

- `GET /api/export-defaults`
- `POST /api/scan`
- `POST /api/export`
- `GET /api/export/:jobId`
- `GET /api/export/:jobId/manifest`

## 검증

문서만 변경했을 때:

```bash
pnpm quality:report
pnpm docs:check
```

빠른 확인:

```bash
pnpm check:quick
```

전체 검증:

```bash
pnpm check:full
```

## 프로젝트 구조

- `src/modules/blog-fetcher`: 네이버 블로그 스캔과 글/자산 fetch
- `src/modules/parser`: SE2, SE3, SE4 본문 파싱
- `src/modules/reviewer`: 파싱 경고 정리
- `src/modules/converter`: Markdown 및 frontmatter 렌더링
- `src/modules/exporter`: export workflow orchestration
- `src/server`: HTTP API와 job 상태 관리
- `src/static`: 로컬 웹 UI
- `src/shared`: 타입, 옵션, capability, 샘플 corpus

## 문서

- [docs/index.md](./docs/index.md)
- [docs/architecture.md](./docs/architecture.md)
- [docs/export-spec.md](./docs/export-spec.md)
- [docs/validation-harness.md](./docs/validation-harness.md)
- [docs/parser-block-catalog.md](./docs/parser-block-catalog.md)
- [docs/samples/index.md](./docs/samples/index.md)
