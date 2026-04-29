import type { CheerioAPI } from "cheerio"

import { LeafBlock } from "../BaseBlock.js"
import type { ParserBlockResult } from "../ParserNode.js"
import type { ParserBlockContext } from "../ParserNode.js"
import { parseSingleColumnTableAsParagraphs } from "../common/Table.js"
import type { AstBlock } from "../../../shared/Types.js"
import { compactText } from "../../../shared/Utils.js"
import { parseHtmlTable } from "../../parser/TableParser.js"

const parseColorScripterCodeBlock = ({
  $,
  element,
}: {
  $: CheerioAPI
  element: ReturnType<CheerioAPI>
}) => {
  if (!element.hasClass("colorscripter-code-table")) {
    return null
  }

  const codeCell = element.find("tr").first().children("td").eq(1)

  if (codeCell.length === 0) {
    return null
  }

  const lineNodes = codeCell
    .find('div[style*="white-space:pre"], div[_foo*="white-space:pre"], pre')
    .toArray()
  const code = lineNodes
    .map((node) => $(node).text().replaceAll("\u00a0", " ").replaceAll("\u200b", ""))
    .map((line) => (line.trim() === "" ? "" : line))
    .join("\n")
    .trimEnd()

  if (!code) {
    return null
  }

  return {
    type: "code",
    language: null,
    code,
  } satisfies AstBlock
}

export class NaverSe2TableBlock extends LeafBlock {
  override match({ node }: ParserBlockContext) {
    return node.type === "tag" && node.tagName.toLowerCase() === "table"
  }

  override convert({ $, $node, options }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const colorScripterCodeBlock = parseColorScripterCodeBlock({
      $,
      element: $node,
    })

    if (colorScripterCodeBlock) {
      return {
        status: "handled",
        blocks: [colorScripterCodeBlock],
      }
    }

    if ($node.hasClass("colorscripter-code-table") && compactText($node.text()) === "") {
      return { status: "skip" }
    }

    const parsedTable = parseHtmlTable({ $, table: $node })
    const flattenedTable = parseSingleColumnTableAsParagraphs({
      parsedTable,
      options,
    })

    if (flattenedTable) {
      return {
        status: "handled",
        blocks: flattenedTable,
      }
    }

    return {
      status: "handled",
      blocks: [
        {
          type: "table",
          rows: parsedTable.rows,
          html: parsedTable.html,
          complex: parsedTable.complex,
        },
      ],
    }
  }
}
