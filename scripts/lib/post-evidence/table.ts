export type EvidenceTableRow = {
  metadata: string | Record<string, string | number | boolean | null | undefined>
  sourceUrl: string
  naverCapturePath: string | null
  markdown: string | null
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
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
    return escapeHtml(metadata)
  }

  const entries = Object.entries(metadata).filter(([, value]) => value !== undefined && value !== null)

  return entries
    .map(([key, value]) => `${escapeHtml(key)}: ${escapeHtml(String(value))}`)
    .join("\n")
}

const renderLinkCell = ({ sourceUrl }: { sourceUrl: string }) =>
  `<a href="${escapeHtml(sourceUrl)}">Naver</a>`

const renderImageCell = (path: string | null, alt: string) =>
  path ? `<img src="${escapeHtml(path)}" alt="${escapeHtml(alt)}" width="260">` : ""

const renderMarkdownCell = (markdown: string | null) => {
  if (markdown === null) {
    return ""
  }

  return `<pre><code>${escapeHtml(normalizeLineEndings(markdown))}</code></pre>`
}

const renderCell = (value: string) => normalizeLineEndings(value)

export const renderEvidenceMarkdownTable = (rows: EvidenceTableRow[]) => {
  const header = [
    "<table>",
    "  <thead>",
    "    <tr>",
    "      <th>Metadata</th>",
    "      <th>Links</th>",
    "      <th>Naver Capture</th>",
    "      <th>Markdown</th>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
  ].join("\n")

  const body = rows
    .map((row) =>
      [
        "    <tr>",
        `      <td>${renderCell(renderMetadata(row.metadata))}</td>`,
        `      <td>${renderCell(renderLinkCell(row))}</td>`,
        `      <td>${renderCell(renderImageCell(row.naverCapturePath, "Naver Capture"))}</td>`,
        `      <td>${renderCell(renderMarkdownCell(row.markdown))}</td>`,
        "    </tr>",
      ].join("\n"),
    )
    .join("\n")
  const footer = [
    "  </tbody>",
    "</table>",
  ].join("\n")

  return rows.length === 0 ? `${header}\n${footer}\n` : `${header}\n${body}\n${footer}\n`
}
