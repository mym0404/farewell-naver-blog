import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockContext } from "../ParserNode.js"

export class NaverSe4CodeBlock extends LeafBlock {
  override readonly id = "se4-code"

  override match({ $node, moduleType }: ParserBlockContext) {
    return moduleType === "v2_code" || $node.hasClass("se-code")
  }

  override convert({ $node }: Parameters<LeafBlock["convert"]>[0]) {
    const sourceNode = $node.find(".__se_code_view").first()
    const classNames = sourceNode.attr("class") ?? ""
    const languageMatch = classNames.match(/language-([\w-]+)/)
    const code = sourceNode.text().trimEnd()

    return code
      ? {
          status: "handled" as const,
          blocks: [
            {
              type: "code" as const,
              language: languageMatch?.[1] ?? null,
              code,
            },
          ],
        }
      : { status: "skip" as const }
  }
}
