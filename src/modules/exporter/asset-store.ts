import path from "node:path"

import type { AssetRecord, ExportOptions } from "../../shared/types.js"
import { normalizeAssetUrl, relativePathFrom } from "../../shared/utils.js"

type AssetDownloader = {
  downloadBinary: (input: {
    sourceUrl: string
    destinationPath: string
  }) => Promise<void>
}

const extensionFromUrl = (value: string) => {
  try {
    const url = new URL(value)
    const extension = path.extname(url.pathname)

    return extension || ".jpg"
  } catch {
    return ".jpg"
  }
}

export class AssetStore {
  readonly outputDir: string
  readonly downloader: AssetDownloader
  readonly options: Pick<ExportOptions, "assets" | "structure">
  readonly cache = new Map<string, string>()
  readonly counters = new Map<string, number>()

  constructor({
    outputDir,
    downloader,
    options,
  }: {
    outputDir: string
    downloader: AssetDownloader
    options: Pick<ExportOptions, "assets" | "structure">
  }) {
    this.outputDir = outputDir
    this.downloader = downloader
    this.options = options
  }

  async saveAsset({
    kind,
    postLogNo,
    sourceUrl,
    markdownFilePath,
  }: {
    kind: "image" | "thumbnail"
    postLogNo: string
    sourceUrl: string
    markdownFilePath: string
  }) {
    const normalizedSourceUrl = normalizeAssetUrl(sourceUrl)
    const shouldDownload =
      this.options.assets.assetPathMode === "relative" &&
      ((kind === "image" && this.options.assets.downloadImages) ||
        (kind === "thumbnail" && this.options.assets.downloadThumbnails))

    if (!shouldDownload) {
      return {
        kind,
        sourceUrl: normalizedSourceUrl,
        relativePath: normalizedSourceUrl,
      } satisfies AssetRecord
    }

    const cacheKey = `${postLogNo}:${kind}:${normalizedSourceUrl}`
    const cachedAbsolutePath = this.cache.get(cacheKey)

    if (cachedAbsolutePath) {
      return {
        kind,
        sourceUrl: normalizedSourceUrl,
        relativePath: relativePathFrom({
          from: markdownFilePath,
          to: cachedAbsolutePath,
        }),
      } satisfies AssetRecord
    }

    const counterKey = `${postLogNo}:${kind}`
    const nextIndex = (this.counters.get(counterKey) ?? 0) + 1
    const extension = extensionFromUrl(normalizedSourceUrl)
    const fileName = `${kind}-${String(nextIndex).padStart(2, "0")}${extension}`
    const absolutePath = path.join(
      this.outputDir,
      this.options.structure.assetDirectoryName,
      postLogNo,
      fileName,
    )

    this.counters.set(counterKey, nextIndex)
    await this.downloader.downloadBinary({
      sourceUrl: normalizedSourceUrl,
      destinationPath: absolutePath,
    })
    this.cache.set(cacheKey, absolutePath)

    return {
      kind,
      sourceUrl: normalizedSourceUrl,
      relativePath: relativePathFrom({
        from: markdownFilePath,
        to: absolutePath,
      }),
    } satisfies AssetRecord
  }
}
