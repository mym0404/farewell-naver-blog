import { parseHtmlTable } from "../../parser/TableParser.js"
import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockResult } from "../ParserNode.js"
import type { ParserBlockContext } from "../ParserNode.js"

export class NaverSe3TableBlock extends LeafBlock {
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
