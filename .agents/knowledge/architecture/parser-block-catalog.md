# Parser Block Catalog

## 목적
이 문서는 parser가 지원하는 capability-first 카탈로그를 정리한다. canonical 지원 단위는 공용 `blockType`이 아니라 `editorVersion + blockType` 조합이다.

## Source Of Truth
- 실제 기준은 [../../../src/shared/parser-capabilities.ts](../../../src/shared/parser-capabilities.ts) 이다.

## 관련 코드
- [../../../src/shared/parser-capabilities.ts](../../../src/shared/parser-capabilities.ts)
- [../../../src/shared/sample-corpus.ts](../../../src/shared/sample-corpus.ts)
- [../../../src/modules/parser/post-parser.ts](../../../src/modules/parser/post-parser.ts)
- [../../../src/modules/parser/se2-parser.ts](../../../src/modules/parser/se2-parser.ts)
- [../../../src/modules/parser/se3-parser.ts](../../../src/modules/parser/se3-parser.ts)
- [../../../src/modules/parser/se4-parser.ts](../../../src/modules/parser/se4-parser.ts)

## 검증 방법
- `pnpm parser:check`: capability id, parser fixture, sample fixture, 테스트 연결이 코드와 맞는지 확인할 때 실행한다.
- `pnpm samples:verify`: 저장된 sample fixture가 parser -> review -> render 경로와 계속 맞는지 확인할 때 실행한다.
- `pnpm samples:refresh -- --id <sampleId>`: live HTML을 다시 받아 fixture를 갱신할 때 실행한다.

## Capability Table
| capabilityId | editorVersion | blockType | fallbackPolicy | verificationMode | sampleIds |
| --- | --- | --- | --- | --- | --- |
| `se2-paragraph` | `2` | `paragraph` | `best-effort` | `sample-fixture` | `se2-legacy`, `se2-code-image-autolayout`, `se2-table-rawhtml-navigation` |
| `se3-paragraph` | `3` | `paragraph` | `best-effort` | `sample-fixture` | `se3-legacy`, `se3-quote-imagegroup-note9`, `se3-quote-table-vita` |
| `se4-paragraph` | `4` | `paragraph` | `best-effort` | `sample-fixture` | `se4-formula-code-linkcard` |
| `se2-heading` | `2` | `heading` | `markdown-paragraph` | `parser-fixture` | - |
| `se4-heading` | `4` | `heading` | `markdown-paragraph` | `sample-fixture` | `se4-heading-itinerary` |
| `se2-quote` | `2` | `quote` | `markdown-paragraph` | `parser-fixture` | - |
| `se3-quote` | `3` | `quote` | `markdown-paragraph` | `sample-fixture` | `se3-quote-imagegroup-note9`, `se3-quote-table-vita` |
| `se4-quote` | `4` | `quote` | `markdown-paragraph` | `sample-fixture` | `se4-quote-formula-code` |
| `se2-divider` | `2` | `divider` | `structured` | `parser-fixture` | - |
| `se4-divider` | `4` | `divider` | `structured` | `sample-fixture` | `se4-formula-code-linkcard`, `se4-image-group` |
| `se2-code` | `2` | `code` | `markdown-paragraph` | `sample-fixture` | `se2-code-image-autolayout` |
| `se3-code` | `3` | `code` | `markdown-paragraph` | `parser-fixture` | - |
| `se4-code` | `4` | `code` | `markdown-paragraph` | `sample-fixture` | `se4-formula-code-linkcard`, `se4-quote-formula-code` |
| `se4-formula` | `4` | `formula` | `skip` | `sample-fixture` | `se4-formula-code-linkcard`, `se4-quote-formula-code` |
| `se2-image` | `2` | `image` | `markdown-paragraph` | `sample-fixture` | `se2-code-image-autolayout`, `se2-table-rawhtml-navigation` |
| `se3-image` | `3` | `image` | `markdown-paragraph` | `sample-fixture` | `se3-quote-imagegroup-note9`, `se3-quote-table-vita` |
| `se4-image` | `4` | `image` | `markdown-paragraph` | `sample-fixture` | `se4-video-table`, `se4-image-legacy-link`, `se4-quote-formula-code` |
| `se2-imageGroup` | `2` | `imageGroup` | `markdown-paragraph` | `sample-fixture` | `se2-thumburl-image-group` |
| `se3-imageGroup` | `3` | `imageGroup` | `markdown-paragraph` | `sample-fixture` | `se3-quote-imagegroup-note9` |
| `se4-imageGroup` | `4` | `imageGroup` | `markdown-paragraph` | `sample-fixture` | `se4-image-group` |
| `se4-video` | `4` | `video` | `skip` | `sample-fixture` | `se4-video-table` |
| `se4-linkCard` | `4` | `linkCard` | `markdown-paragraph` | `sample-fixture` | `se4-formula-code-linkcard`, `se4-quote-formula-code` |
| `se2-table` | `2` | `table` | `raw-html` | `sample-fixture` | `se2-table-rawhtml-navigation` |
| `se3-table` | `3` | `table` | `raw-html` | `sample-fixture` | `se3-quote-table-vita` |
| `se4-table` | `4` | `table` | `raw-html` | `sample-fixture` | `se4-video-table` |
| `se2-rawHtml` | `2` | `rawHtml` | `raw-html` | `sample-fixture` | `se2-table-rawhtml-navigation` |
| `se4-rawHtml` | `4` | `rawHtml` | `raw-html` | `parser-fixture` | - |

## Notes
- capability id는 이후 parser/renderer 옵션, 미리보기, 문서화의 기준 seam이다.
- `sample-fixture` capability는 공개 글 fixture로 회귀를 확인한다.
- `parser-fixture` capability는 parser unit test와 parser fixture로만 관리한다. 현재는 `se2-heading`, `se2-quote`, `se2-divider`, `se3-code`, `se4-rawHtml`가 여기에 해당한다.
- `rawHtml`은 fallback 성격이 강해서 sample fixture보다 parser fixture와 parser unit test 비중이 높다.
- SE4 `image`는 `se-module-image-link`와 `__se_image_link` 두 앵커 변형을 sample fixture로 함께 검증한다.
- SE2 Color Scripter(`table.colorscripter-code-table`)는 일반 table이 아니라 code capability 경로로 먼저 승격한다.
- 옵션/미리보기 확장은 `blockType` 공통 축보다 capability id 축을 우선한다. 같은 `paragraph`라도 `se2-paragraph`, `se4-paragraph`는 이후 서로 다른 정책 seam을 가질 수 있다.
