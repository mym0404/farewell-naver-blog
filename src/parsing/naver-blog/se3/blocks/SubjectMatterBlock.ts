import type { ImageData } from "../../../../domain/ast/Types.js"
import type { ParserBlockContext } from "../../core/BaseBlock.js"
import { normalizeAssetUrl } from "../../../../domain/blog/NaverUrl.js"
import { compactText } from "../../../../shared/text/TextUtils.js"
import { LeafBlock } from "../../core/BaseBlock.js"

export class NaverSe3SubjectMatterBlock extends LeafBlock {
  override readonly id = "subjectMatter"
  override readonly label = "소재 카드"

  override match({ $node }: ParserBlockContext) {
    return $node.hasClass("se_subjectMatter") && $node.hasClass("subjectMatter_book")
  }

  override convert({ $node, options }: Parameters<LeafBlock["convert"]>[0]) {
    const blocks = []
    const imageNode = $node.find(".subjectMatter_thumb img").first()
    const imageSource = imageNode.attr("data-lazy-src") ?? imageNode.attr("src")

    if (imageSource?.trim()) {
      blocks.push({
        type: "image" as const,
        image: {
          sourceUrl: normalizeAssetUrl(imageSource),
          originalSourceUrl: null,
          alt: imageNode.attr("alt")?.trim() ?? "",
          caption: null,
          mediaKind: "image",
        } satisfies ImageData,
      })
    }

    const title = compactText($node.find(".subjectMatter_title_text").first().text())
    const details = $node
      .find(".subjectMatter_info_item")
      .toArray()
      .map((node) => {
        const detailNode = $node.find(node)
        const label = compactText(detailNode.find(".subjectMatter_info_title").first().text())
        const value = compactText(detailNode.find(".subjectMatter_info_text").first().text())

        if (!label || !value) {
          return null
        }

        return `${label}: ${value}`
      })
      .filter((detail): detail is string => detail !== null)
    const summaryLines = [title ? `**${title}**` : "", ...details].filter(Boolean)

    if (summaryLines.length > 0) {
      blocks.push({
        type: "paragraph" as const,
        text: summaryLines.join("  \n"),
      })
    }

    const detailLink = $node.find("a.subjectMatter_item_link").first()
    const detailUrl = detailLink.attr("href")?.trim()

    if (detailUrl) {
      const label = compactText(detailLink.text()) || "상세보기"
      const url = options.resolveLinkUrl ? options.resolveLinkUrl(detailUrl) : detailUrl

      blocks.push({
        type: "paragraph" as const,
        text: `[${label}](${url})`,
      })
    }

    if (blocks.length === 0) {
      throw new Error("SE3 subject matter block parsing failed.")
    }

    return blocks
  }
}
