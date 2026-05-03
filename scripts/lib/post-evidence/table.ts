export type EvidenceTableRow = {
  metadata: string | Record<string, string | number | boolean | null | undefined>
  sourceUrl: string
  rendererUrl: string | null
  rendererError: string | null
  naverCapturePath: string | null
  markdown: string | null
  renderedCapturePath: string | null
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const escapeTableCell = (value: string) =>
  value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\|/g, "&#124;")
    .replace(/\n/g, "<br>")
    .trim()

const renderMetadata = (
  metadata: EvidenceTableRow["metadata"],
) => {
  if (typeof metadata === "string") {
    return escapeHtml(metadata)
  }

  const entries = Object.entries(metadata).filter(([, value]) => value !== undefined && value !== null)

  return entries
    .map(([key, value]) => `${escapeHtml(key)}: ${escapeHtml(String(value))}`)
    .join("\n")
}

const renderLinkCell = ({
  sourceUrl,
  rendererUrl,
  rendererError,
}: {
  sourceUrl: string
  rendererUrl: string | null
  rendererError: string | null
}) => {
  const links = [`[Naver](${sourceUrl})`]

  if (rendererUrl) {
    links.push(`[Renderer](${rendererUrl})`)
  } else {
    links.push(`실패: ${escapeHtml(rendererError ?? "renderer link unavailable")}`)
  }

  return links.join("\n")
}

const renderImageCell = (path: string | null, alt: string) =>
  path ? `![${alt}](${path})` : ""

const renderMarkdownCell = (markdown: string | null) => {
  if (markdown === null) {
    return ""
  }

  return `<pre><code>${escapeHtml(markdown)}</code></pre>`
}

const renderCell = (value: string) => escapeTableCell(value)

export const renderEvidenceMarkdownTable = (rows: EvidenceTableRow[]) => {
  const header = "| Metadata | Links | Naver Capture | Markdown | Rendered Capture |"
  const separator = "| --- | --- | --- | --- | --- |"

  if (rows.length === 0) {
    return `${header}\n${separator}\n`
  }

  const body = rows
    .map((row) =>
      [
        renderCell(renderMetadata(row.metadata)),
        renderCell(renderLinkCell(row)),
        renderCell(renderImageCell(row.naverCapturePath, "Naver Capture")),
        renderCell(renderMarkdownCell(row.markdown)),
        renderCell(renderImageCell(row.renderedCapturePath, "Rendered Capture")),
      ].join(" | "),
    )
    .map((line) => `| ${line} |`)
    .join("\n")

  return `${header}\n${separator}\n${body}\n`
}
