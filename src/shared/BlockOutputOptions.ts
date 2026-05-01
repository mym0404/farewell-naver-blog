import type {
  BlockOutputSelection,
  MarkdownLinkStyle,
  OutputOption,
} from "./Types.js"

export const paragraphOutputOptions = [
  {
    id: "inline-links",
    label: "inline links",
    description: "문단 안 링크를 inline 형식으로 출력합니다.",
    preview: {
      type: "paragraph",
      text: "일반 링크: [example](https://example.com)",
    },
    isDefault: true,
  },
  {
    id: "reference-links",
    label: "reference links",
    description: "문단 안 링크를 reference 형식으로 분리합니다.",
    preview: {
      type: "paragraph",
      text: "일반 링크: [example][ref-1]\n\n[ref-1]: https://example.com",
    },
  },
] satisfies OutputOption<"paragraph">[]

export const linkCardOutputOptions = [
  {
    id: "title-link",
    label: "title link",
    description: "카드 제목을 inline 링크로 출력합니다.",
    preview: {
      type: "linkCard",
      card: {
        title: "External article",
        description: "preview text",
        url: "https://example.com/article",
        imageUrl: "https://example.com/cover.png",
      },
    },
    isDefault: true,
  },
  {
    id: "reference-link",
    label: "reference link",
    description: "카드 제목 링크를 reference 형식으로 분리합니다.",
    preview: {
      type: "linkCard",
      card: {
        title: "External article",
        description: "preview text",
        url: "https://example.com/article",
        imageUrl: "https://example.com/cover.png",
      },
    },
  },
] satisfies OutputOption<"linkCard">[]

export const getMarkdownLinkStyleFromSelection = (selection?: BlockOutputSelection): MarkdownLinkStyle => {
  return selection?.variant === "reference-links" || selection?.variant === "reference-link"
    ? "referenced"
    : "inlined"
}
