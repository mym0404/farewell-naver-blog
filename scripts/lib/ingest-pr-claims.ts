const supportUnitClaimPattern = /<!--\s*ingest-blog:supportUnitKey=([^>\s]+)\s*-->/
const ingestBlogPrTitlePrefixByType = {
  newBlockParser: "[📦 New Block Parser]",
  parserImprovement: "[🎉 Parser Improvement]",
} as const
const ingestBlogPrTitlePrefixPattern = /^\[[^\]]+\]\s*/

export const createSupportUnitClaim = (supportUnitKey: string) =>
  `<!-- ingest-blog:supportUnitKey=${supportUnitKey} -->`

export const parseSupportUnitClaim = (body: string | null | undefined) =>
  body?.match(supportUnitClaimPattern)?.[1] ?? null

export const createFailureBlockLabel = (failureBlockHash: string) =>
  `failure-block:${failureBlockHash}`

export const createIngestBlogPrTitle = ({
  title,
  type,
}: {
  title: string
  type: keyof typeof ingestBlogPrTitlePrefixByType
}) => `${ingestBlogPrTitlePrefixByType[type]} ${title.replace(ingestBlogPrTitlePrefixPattern, "")}`
