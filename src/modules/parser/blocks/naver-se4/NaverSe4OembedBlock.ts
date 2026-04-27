import { load } from "cheerio"

import type { UnknownRecord } from "../../../../shared/types.js"
import { compactText, normalizeAssetUrl } from "../../../../shared/utils.js"
import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext, ParserBlockResult } from "../parser-node.js"

export class NaverSe4OembedBlock extends LeafBlock {
  override readonly id = "se4-oembed"

  override match({ $node, moduleType }: ParserBlockContext) {
    return moduleType === "v2_oembed" || $node.hasClass("se-oembed")
  }

  override convert({ moduleData }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const data = ((moduleData ?? {}).data ?? {}) as UnknownRecord & {
      html?: string
      inputUrl?: string
      thumbnailUrl?: string
      description?: string
      title?: string
      providerUrl?: string
    }
    const iframeUrl =
      typeof data.html === "string" && data.html
        ? load(data.html)("iframe").attr("src") ?? null
        : null
    const url = data.inputUrl ?? iframeUrl ?? data.providerUrl ?? ""

    if (!url) {
      return {
        status: "skip",
        warnings: ["oEmbed 블록을 해석하지 못해 건너뛰었습니다."],
      }
    }

    return {
      status: "handled",
      blocks: [
        {
          type: "linkCard",
          card: {
            title: compactText(data.title ?? "") || url,
            description: compactText(data.description ?? ""),
            url,
            imageUrl:
              typeof data.thumbnailUrl === "string" ? normalizeAssetUrl(data.thumbnailUrl) : null,
          },
        },
      ],
    }
  }
}
