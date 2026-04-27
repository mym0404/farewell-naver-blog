import { compactText } from "../../../../shared/Utils.js"
import { LeafBlock } from "../ParserNode.js"
import type { ParserBlockContext, ParserBlockResult } from "../ParserNode.js"
import { parseJsonAttribute } from "./JsonAttribute.js"
import { buildNaverMapSearchUrl } from "./MapUrl.js"

export class NaverSe4MapBlock extends LeafBlock {
  override readonly id = "se4-map"

  override match({ $node, moduleType }: ParserBlockContext) {
    return moduleType === "v2_map" || $node.hasClass("se-placesMap")
  }

  override convert({ $node, moduleData }: Parameters<LeafBlock["convert"]>[0]): ParserBlockResult {
    const data = (moduleData?.data ?? {}) as {
      places?: Array<{
        placeId?: string
        name?: string
        address?: string
        bookingUrl?: string | null
      }>
    }

    const placesFromModule = (data.places ?? []).flatMap((place) => {
      const title = compactText(place.name ?? "")
      const description = compactText(place.address ?? "")

      if (!title) {
        return []
      }

      return [
        {
          type: "linkCard" as const,
          card: {
            title,
            description,
            url:
              typeof place.bookingUrl === "string" && place.bookingUrl.trim()
                ? place.bookingUrl.trim()
                : buildNaverMapSearchUrl(title),
            imageUrl: null,
          },
        },
      ]
    })

    if (placesFromModule.length > 0) {
      return {
        status: "handled",
        blocks: placesFromModule,
      }
    }

    const blocks = $node
      .find("a.se-map-info")
      .toArray()
      .flatMap((node) => {
        const $link = $node.find(node)
        const linkData = parseJsonAttribute($link.attr("data-linkdata"))
        const title = compactText($link.find(".se-map-title").text()) || compactText(String(linkData?.name ?? ""))
        const description =
          compactText($link.find(".se-map-address").text()) || compactText(String(linkData?.address ?? ""))

        if (!title) {
          return []
        }

        return [
          {
            type: "linkCard" as const,
            card: {
              title,
              description,
              url:
                typeof linkData?.bookingUrl === "string" && linkData.bookingUrl.trim()
                  ? linkData.bookingUrl.trim()
                  : buildNaverMapSearchUrl(title),
              imageUrl: null,
            },
          },
        ]
      })

    return {
      status: "handled",
      blocks,
    }
  }
}
