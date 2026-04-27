import { parseHtmlTable } from "../../table-parser.js"
import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext } from "../parser-node.js"

const getComponentHtml = ({
  $,
  $node,
}: {
  $: Parameters<LeafBlock["convert"]>[0]["$"]
  $node: Parameters<LeafBlock["convert"]>[0]["$node"]
}) => {
  const clone = $node.clone()
  clone.find("script.__se_module_data").remove()

  return $.html(clone).trim()
}

export class NaverSe4TableBlock extends LeafBlock {
  override readonly id = "se4-table"

  override match({ $node, moduleType }: ParserBlockContext) {
    return moduleType === "v2_table" || $node.hasClass("se-table")
  }

  override convert({ $, $node }: Parameters<LeafBlock["convert"]>[0]) {
    const table = $node.find("table").first()

    if (table.length === 0) {
      return {
        status: "fallback" as const,
        html: getComponentHtml({ $, $node }),
        reason: "table-fallback",
        warnings: ["표 블록을 표로 해석하지 못해 원본 HTML로 보존했습니다."],
      }
    }

    const parsedTable = parseHtmlTable({ $, table })

    return {
      status: "handled" as const,
      blocks: [
        {
          type: "table" as const,
          rows: parsedTable.rows,
          html: parsedTable.html,
          complex: parsedTable.complex,
        },
      ],
    }
  }
}
