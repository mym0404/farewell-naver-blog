# Export Spec

## 목적
이 문서는 scan, category select, export 옵션, Markdown 출력, manifest의 제품 규약을 정의한다.

## Source Of Truth
실제 동작은 `src/server/http-server.ts`, `src/modules/exporter/naver-blog-exporter.ts`, `src/modules/converter/markdown-renderer.ts`에 구현되어 있다.

## 관련 코드
- [../src/server/http-server.ts](../src/server/http-server.ts)
- [../src/shared/export-options.ts](../src/shared/export-options.ts)
- [../src/modules/exporter/naver-blog-exporter.ts](../src/modules/exporter/naver-blog-exporter.ts)
- [../src/modules/converter/markdown-renderer.ts](../src/modules/converter/markdown-renderer.ts)

## 검증 방법
- `pnpm test`
- `pnpm samples:verify`
- `pnpm smoke:ui`

## Manual Verification
- `scripts/export-single-post.ts`는 exporter와 동일한 Markdown/export option 규칙으로 특정 `blogId + logNo` 글 1건을 바로 렌더링한다.

## Workflow
1. 사용자가 블로그 ID 또는 URL을 입력한다.
2. scan으로 전체 공개 글 수와 카테고리 목록을 확인한다.
3. 사용자가 카테고리와 export 옵션을 고른다.
4. exporter가 공개 글을 순회해 Markdown과 `manifest.json`을 만든다.

## Output Rules
- 기본 포맷은 `GFM + YAML frontmatter + 로컬 이미지 자산`이다.
- 파일 구조는 category path 기반 폴더를 기본으로 사용한다.
- 파일명 기본값은 `YYYY-MM-DD-logNo-slug.md`다.
- video는 기본적으로 썸네일 + 링크로 렌더링한다.
- table은 단순 표는 GFM, 복잡한 표는 HTML fallback을 사용한다.
- raw HTML은 기본적으로 보존한다.

## API Surface
- `GET /api/export-defaults`
- `POST /api/scan`
- `POST /api/export`
- `GET /api/export/:jobId`
- `GET /api/export/:jobId/manifest`

`GET /api/export-defaults` 응답은 기본 `options` 외에 `frontmatterFieldOrder`, `frontmatterFieldMeta`를 포함한다.
`frontmatterFieldMeta`의 각 항목은 `label`, `description`, `defaultAlias`를 내려 UI 설명과 placeholder의 source of truth로 사용한다.

## Manifest Invariants
- `totalPosts = successCount + failureCount`
- `warningCount`는 post warning 총합과 일치해야 한다.
- 성공한 post는 `outputPath`가 `.md`로 끝나야 한다.
- `selectedCategoryIds`는 사용자가 보낸 선택값을 보존해야 한다.

## Frontmatter Rules
- `category`는 객체가 아니라 카테고리 이름 문자열로 기록한다.
- `categoryPath`는 상위 경로 배열로 따로 기록한다.
- 각 frontmatter field는 UI에서 on/off와 alias를 같이 조정할 수 있다.
- 각 field는 UI에서 한 줄 설명과 alias 입력을 함께 보여준다.
- alias가 비어 있으면 기본 field 이름을 그대로 사용한다.
- alias는 영문자 또는 `_`로 시작하고, 이후에는 영문자, 숫자, `-`, `_`만 허용한다.
- 활성화된 field끼리 같은 alias를 사용하면 export를 시작하지 않는다.
