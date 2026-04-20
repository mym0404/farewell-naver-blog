# Sample Corpus

## 목적
이 문서는 capability-first parser regression에 쓰는 공개 네이버 블로그 샘플과 fixture 운영 방식을 정리한다.

## Source Of Truth
- 실제 샘플 목록과 metadata는 [../../../src/shared/sample-corpus.ts](../../../src/shared/sample-corpus.ts) 이다.
- 실제 fixture 파일은 `tests/fixtures/samples/<sampleId>/source.html`, `expected.md` 이다.

## 관련 코드
- [../../../src/shared/sample-corpus.ts](../../../src/shared/sample-corpus.ts)
- [../../../scripts/harness/verify-sample-exports.ts](../../../scripts/harness/verify-sample-exports.ts)
- [../../../scripts/harness/refresh-sample-fixtures.ts](../../../scripts/harness/refresh-sample-fixtures.ts)
- [../../../scripts/harness/lib/sample-fixtures.ts](../../../scripts/harness/lib/sample-fixtures.ts)

## 검증 방법
- `pnpm samples:verify`: 저장된 `source.html -> expected.md` fixture를 오프라인으로 다시 확인한다.
- `pnpm parser:check`: sample id와 expected capability가 capability catalog와 계속 맞물리는지 확인한다.
- `pnpm samples:refresh -- --id <sampleId>`: 지정 sample 하나의 live HTML과 expected Markdown fixture를 다시 만든다.

## Fixture Structure
- `source.html`: `fetchPostHtml()`가 받은 원문 전체 HTML이다.
- `expected.md`: 같은 sample metadata와 fixture 전용 export 옵션으로 render한 전체 Markdown 골든이다.
- sample fixture는 parser 회귀의 기본 경로다. live fetch는 fixture refresh/drift check 보조 경로다.
- fixture 전용 export 옵션은 `imageHandlingMode=remote`, `downloadImages=false`, `downloadThumbnails=false`, `frontmatter.exportedAt=false`로 고정한다.
- capability는 `sample-fixture`와 `parser-fixture`로 나뉜다. 이 문서는 `sample-fixture` capability에 대응하는 공개 글 fixture만 다룬다.

## Sample Table
| id | blogId | logNo | editorVersion | expectedCapabilityIds | description |
| --- | --- | --- | --- | --- | --- |
| `se4-video-table` | `mym0404` | `221302086471` | `4` | `se4-image`, `se4-video`, `se4-table` | 오래된 SE4의 video/table 대표 샘플 |
| `se4-formula-code-linkcard` | `mym0404` | `223034929697` | `4` | `se4-linkCard`, `se4-image`, `se4-divider`, `se4-paragraph`, `se4-formula`, `se4-code` | 수식/코드/링크 카드 대표 샘플 |
| `se4-image-group` | `mym0404` | `224056819985` | `4` | `se4-paragraph`, `se4-divider`, `se4-imageGroup` | imageGroup 대표 샘플 |
| `se4-heading-itinerary` | `goyamee` | `223511986798` | `4` | `se4-paragraph`, `se4-image`, `se4-heading`, `se4-divider`, `se4-imageGroup`, `se4-linkCard`, `se4-table` | sectionTitle heading이 반복되는 여행 일정 대표 샘플 |
| `se4-image-legacy-link` | `mym0404` | `221589718939` | `4` | `se4-paragraph`, `se4-image` | `__se_image_link` 기반 본문 이미지 대표 샘플 |
| `se4-quote-formula-code` | `mym0404` | `222619228134` | `4` | `se4-linkCard`, `se4-image`, `se4-divider`, `se4-paragraph`, `se4-quote`, `se4-formula`, `se4-code` | quote 포함 SE4 대표 샘플 |
| `se2-legacy` | `mym0404` | `220496669802` | `2` | `se2-paragraph` | SE2 legacy 대표 샘플 |
| `se2-code-image-autolayout` | `mym0404` | `221504285266` | `2` | `se2-paragraph`, `se2-image`, `se2-code` | SE2 code/image 대표 샘플 |
| `se2-table-rawhtml-navigation` | `mym0404` | `221459172607` | `2` | `se2-paragraph`, `se2-image`, `se2-table`, `se2-rawHtml` | SE2 table/rawHtml 대표 샘플 |
| `se2-thumburl-image-group` | `mym0404` | `221425068566` | `2` | `se2-imageGroup`, `se2-paragraph` | `thumburl` 기반 SE2 본문 이미지 묶음 대표 샘플 |
| `se3-legacy` | `mym0404` | `221236891086` | `3` | `se3-paragraph` | SE3 legacy 대표 샘플 |
| `se3-quote-imagegroup-note9` | `sekishin` | `221405258251` | `3` | `se3-paragraph`, `se3-image`, `se3-quote`, `se3-imageGroup` | SE3 quote/imageGroup 대표 샘플 |
| `se3-quote-table-vita` | `sekishin` | `221290869775` | `3` | `se3-paragraph`, `se3-image`, `se3-quote`, `se3-table` | SE3 table/quote 대표 샘플 |

## Selection Rules
- sample은 가능한 한 capability id를 직접 증명하는 대표 글을 선택한다.
- `sample-fixture` capability에 연결할 sample이 없으면 gap을 숨기지 않고 generated coverage에 남긴다.
- `parser-fixture` capability는 sample gap으로 계산하지 않는다. 이 경우 parser unit test와 parser fixture가 canonical 검증 경로다.
- 새 sample을 추가할 때는 `sample-corpus.ts` metadata, `source.html`, `expected.md`를 같이 추가한다.
- sample을 갱신할 때는 기본적으로 `pnpm samples:refresh -- --id <sampleId>`를 사용한다.
- `--all` refresh는 대량 drift 확인용이다. 기본 작업 루프에서는 id 단위 갱신을 우선한다.
