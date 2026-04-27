import type { UnknownRecord } from "../../../../shared/types.js"
import { normalizeAssetUrl } from "../../../../shared/utils.js"
import { LeafBlock } from "../parser-node.js"
import type { ParserBlockContext } from "../parser-node.js"

export class NaverSe4VideoBlock extends LeafBlock {
  override readonly id = "se4-video"

  override match({ $node, moduleType }: ParserBlockContext) {
    return moduleType === "v2_video" || $node.hasClass("se-video")
  }

  override convert({ moduleData, sourceUrl }: Parameters<LeafBlock["convert"]>[0]) {
    const data = ((moduleData ?? {}).data ?? {}) as UnknownRecord & {
      thumbnail?: string
      vid?: string
      inkey?: string
      mediaMeta?: {
        title?: string
      }
      width?: string
      height?: string
    }

    return {
      status: "handled" as const,
      blocks: [
        {
          type: "video" as const,
          video: {
            title: data.mediaMeta?.title?.trim() || "Video",
            thumbnailUrl: data.thumbnail ? normalizeAssetUrl(data.thumbnail) : null,
            sourceUrl: sourceUrl ?? "",
            vid: data.vid ?? null,
            inkey: data.inkey ?? null,
            width: data.width ? Number(data.width) : null,
            height: data.height ? Number(data.height) : null,
          },
        },
      ],
    }
  }
}
