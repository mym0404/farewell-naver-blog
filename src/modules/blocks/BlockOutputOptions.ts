import type {
  AnyBlockOutputOptionDefinition,
  BlockOutputOptionDefinition,
  BlockType,
} from "../../shared/Types.js"
import { defaultBlockOutputSelections } from "../../shared/BlockRegistry.js"

const previewImage = {
  sourceUrl: "https://example.com/image.png",
  originalSourceUrl: "https://example.com/image.png",
  alt: "diagram",
  caption: "caption",
  mediaKind: "image",
} as const

const blockOutputOptionDefinitions = [
  {
    blockId: "paragraph",
    astBlockType: "paragraph",
    label: "문단",
    description: "문단 텍스트를 Markdown 본문 줄로 출력합니다.",
    previewBlock: {
      type: "paragraph",
      text: "첫 줄입니다.\n\n둘째 문단입니다.",
    },
    defaultSelection: defaultBlockOutputSelections.paragraph,
    variants: [{ id: "markdown-paragraph", label: "Markdown 문단", description: "정규화된 문단 텍스트를 그대로 출력합니다." }],
  },
  {
    blockId: "heading",
    astBlockType: "heading",
    label: "제목",
    description: "제목 레벨과 텍스트를 Markdown heading으로 출력합니다.",
    previewBlock: {
      type: "heading",
      level: 2,
      text: "Section title",
    },
    defaultSelection: defaultBlockOutputSelections.heading,
    variants: [{ id: "markdown-heading", label: "Markdown heading", description: "ATX heading(`#`) 형식으로 출력합니다." }],
    params: [
      {
        key: "levelOffset",
        label: "제목 레벨 오프셋",
        description: "원본 제목 레벨에 더하거나 빼는 값입니다.",
        input: "number",
      },
    ],
  },
  {
    blockId: "quote",
    astBlockType: "quote",
    label: "인용문",
    description: "인용문을 `>` prefix로 출력합니다.",
    previewBlock: {
      type: "quote",
      text: "Quoted line\nsecond line",
    },
    defaultSelection: defaultBlockOutputSelections.quote,
    variants: [{ id: "blockquote", label: "blockquote", description: "모든 줄 앞에 `>`를 붙입니다." }],
  },
  {
    blockId: "divider",
    astBlockType: "divider",
    label: "구분선",
    description: "본문 구분선을 Markdown horizontal rule로 출력합니다.",
    previewBlock: {
      type: "divider",
    },
    defaultSelection: defaultBlockOutputSelections.divider,
    variants: [
      { id: "dash-rule", label: "`---`", description: "dash 구분선으로 출력합니다." },
      { id: "asterisk-rule", label: "`***`", description: "asterisk 구분선으로 출력합니다." },
    ],
  },
  {
    blockId: "code",
    astBlockType: "code",
    label: "코드",
    description: "코드를 fenced code block으로 출력합니다.",
    previewBlock: {
      type: "code",
      language: "ts",
      code: "const value = 1",
    },
    defaultSelection: defaultBlockOutputSelections.code,
    variants: [
      { id: "backtick-fence", label: "``` fence", description: "backtick fence를 사용합니다." },
      { id: "tilde-fence", label: "~~~ fence", description: "tilde fence를 사용합니다." },
    ],
  },
  {
    blockId: "formula",
    astBlockType: "formula",
    label: "수식",
    description: "인라인/블록 수식을 wrapper 또는 math fence로 출력합니다.",
    previewBlock: {
      type: "formula",
      formula: "x^2 + y^2 = z^2",
      display: true,
    },
    defaultSelection: defaultBlockOutputSelections.formula,
    variants: [
      { id: "wrapper", label: "custom wrapper", description: "인라인과 블록 수식을 wrapper 문자열로 감쌉니다." },
      { id: "math-fence", label: "```math fence", description: "블록 수식은 `math` fence, 인라인 수식은 wrapper로 출력합니다." },
    ],
    params: [
      {
        key: "inlineWrapper",
        label: "인라인 wrapper",
        description: "예: `$`, `\\(...\\)`",
        input: "text",
      },
      {
        key: "blockWrapper",
        label: "블록 wrapper",
        description: "예: `$$`, `\\[...\\]`",
        input: "text",
        whenVariants: ["wrapper"],
      },
    ],
  },
  {
    blockId: "image",
    astBlockType: "image",
    label: "이미지",
    description: "이미지를 Markdown 이미지, 링크 감싼 이미지, 링크만 남기기 중 하나로 출력합니다.",
    previewBlock: {
      type: "image",
      image: previewImage,
    },
    defaultSelection: defaultBlockOutputSelections.image,
    variants: [
      { id: "markdown-image", label: "일반 Markdown 이미지", description: "이미지를 `![alt](url)` 형식으로 출력합니다." },
      { id: "linked-image", label: "원본 링크 감싸기", description: "이미지를 원본 링크로 감싼 뒤 출력합니다." },
      { id: "source-only", label: "링크만 남기기", description: "이미지 대신 링크 텍스트만 남깁니다." },
    ],
  },
  {
    blockId: "imageGroup",
    astBlockType: "imageGroup",
    label: "이미지 묶음",
    description: "이미지 묶음을 개별 이미지 블록으로 출력합니다.",
    previewBlock: {
      type: "imageGroup",
      images: [
        previewImage,
        {
          ...previewImage,
          sourceUrl: "https://example.com/image-2.png",
          originalSourceUrl: "https://example.com/image-2.png",
          alt: "detail",
        },
      ],
    },
    defaultSelection: defaultBlockOutputSelections.imageGroup,
    variants: [{ id: "split-images", label: "개별 이미지로 분해", description: "이미지 하나씩 순서대로 출력합니다." }],
  },
  {
    blockId: "video",
    astBlockType: "video",
    label: "비디오",
    description: "비디오를 원문 링크로 출력합니다.",
    previewBlock: {
      type: "video",
      video: {
        title: "Demo video",
        thumbnailUrl: "https://example.com/video-thumb.png",
        sourceUrl: "https://example.com/video",
        vid: "vid",
        inkey: "inkey",
        width: 640,
        height: 360,
      },
    },
    defaultSelection: defaultBlockOutputSelections.video,
    variants: [{ id: "source-link", label: "원문 링크", description: "비디오 제목을 원문 URL 링크로 출력합니다." }],
  },
  {
    blockId: "linkCard",
    astBlockType: "linkCard",
    label: "링크 카드",
    description: "링크 카드 제목을 Markdown 링크로 출력합니다.",
    previewBlock: {
      type: "linkCard",
      card: {
        title: "External article",
        description: "preview text",
        url: "https://example.com/article",
        imageUrl: "https://example.com/cover.png",
      },
    },
    defaultSelection: defaultBlockOutputSelections.linkCard,
    variants: [{ id: "title-link", label: "제목 링크", description: "카드 제목을 링크로 출력합니다." }],
  },
  {
    blockId: "table",
    astBlockType: "table",
    label: "표",
    description: "표를 GFM 우선 또는 HTML 유지로 출력합니다.",
    previewBlock: {
      type: "table",
      complex: false,
      html: "<table><tr><th>col</th></tr><tr><td>value</td></tr></table>",
      rows: [
        [{ text: "col", html: "col", colspan: 1, rowspan: 1, isHeader: true }],
        [{ text: "value", html: "value", colspan: 1, rowspan: 1, isHeader: false }],
      ],
    },
    defaultSelection: defaultBlockOutputSelections.table,
    variants: [
      { id: "gfm-or-html", label: "GFM 우선", description: "단순 표는 GFM, 복잡한 표는 HTML fallback으로 처리합니다." },
      { id: "html-only", label: "원본 HTML 유지", description: "표를 HTML fragment로 유지합니다." },
    ],
  },
] satisfies AnyBlockOutputOptionDefinition[]

export const blockOutputOptions = Object.fromEntries(
  blockOutputOptionDefinitions.map((definition) => [definition.astBlockType, definition]),
) as {
  [Key in BlockType]: BlockOutputOptionDefinition<Key>
}
