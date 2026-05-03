export type EvidenceTableRow = {
  metadata: string | Record<string, string | number | boolean | null | undefined>
  sourceUrl: string
  naverCapturePath: string | null
  markdown: string | null
}

const escapeHtmlAttribute = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")

const normalizeLineEndings = (value: string) =>
  value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()

const renderMetadata = (
  metadata: EvidenceTableRow["metadata"],
) => {
  if (typeof metadata === "string") {
    return metadata
  }

  const entries = Object.entries(metadata).filter(([, value]) => value !== undefined && value !== null)

  return entries
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join("\n")
}

const renderLinkCell = ({ sourceUrl }: { sourceUrl: string }) =>
  `[Naver](${sourceUrl})`

const renderImageCell = (path: string | null, alt: string) =>
  path ? `<img src="${escapeHtmlAttribute(path)}" alt="${escapeHtmlAttribute(alt)}" width="300">` : ""

const renderMarkdownCell = (markdown: string | null) => {
  if (markdown === null) {
    return ""
  }

  const value = normalizeLineEndings(markdown).replace(/\n/g, "\\n")
  const backtickRuns = value.match(/`+/g) ?? []
  const fenceLength = Math.max(1, ...backtickRuns.map((run) => run.length)) + 1
  const fence = "`".repeat(fenceLength)

  return `${fence} ${value} ${fence}`
}

const renderCell = (value: string) =>
  normalizeLineEndings(value)
    .replace(/\n/g, " / ")
    .replace(/\|/g, "\\|")

export const renderEvidenceMarkdownTable = (rows: EvidenceTableRow[]) => {
  const header = "| Metadata | Links | Naver Capture | Markdown |"
  const separator = "| --- | --- | --- | --- |"

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
      ].join(" | "),
    )
    .map((line) => `| ${line} |`)
    .join("\n")

  return `${header}\n${separator}\n${body}\n`
}
