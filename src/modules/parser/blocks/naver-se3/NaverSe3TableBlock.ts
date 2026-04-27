import { parseHtmlTable } from "../../table-parser.js"
import { LeafBlock } from "../parser-node.js"
import type { ParserBlockResult } from "../parser-node.js"
import type { ParserBlockContext } from "../parser-node.js"

export class NaverSe3TableBlock extends LeafBlock {
  override readonly id = "se3-table"

  override match({ $node }: ParserBlockContext) {
    return $node.find("table").first().length > 0
  }

  override convert({ $, $node }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const parsedTable = parseHtmlTable({ $, table: $node.find("table").first() })

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
