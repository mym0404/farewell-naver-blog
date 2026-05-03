const supportUnitClaimPattern = /<!--\s*ingest-blog:supportUnitKey=([^>\s]+)\s*-->/

export const createSupportUnitClaim = (supportUnitKey: string) =>
  `<!-- ingest-blog:supportUnitKey=${supportUnitKey} -->`

export const parseSupportUnitClaim = (body: string | null | undefined) =>
  body?.match(supportUnitClaimPattern)?.[1] ?? null

export const createFailureBlockLabel = (failureBlockHash: string) =>
  `failure-block:${failureBlockHash}`

export const createNewBlockPrTitle = (title: string) =>
  `[📦 New Block] ${title.replace(/^\[📦 New Block\]\s*/, "")}`
