import { deflateSync } from "node:zlib"

const MARKDOWN_VIEWER_SHARE_URL_PREFIX = "https://markdownviewer.pages.dev/#share="
const MARKDOWN_VIEWER_MAX_URL_LENGTH = 32000

const toBase64Url = (input: Buffer) =>
  input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")

export const buildMarkdownViewerShareUrl = (markdown: string) => {
  const encoded = toBase64Url(deflateSync(Buffer.from(markdown, "utf8")))
  const shareUrl = `${MARKDOWN_VIEWER_SHARE_URL_PREFIX}${encoded}`

  return shareUrl.length <= MARKDOWN_VIEWER_MAX_URL_LENGTH ? shareUrl : null
}
