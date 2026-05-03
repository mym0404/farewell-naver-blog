type PullRequestClaimSource = {
  body?: string | null
}

const supportUnitClaimPattern = /<!--\s*ingest-blog:supportUnitKey=([^>\s]+)\s*-->/

export const createSupportUnitClaim = (supportUnitKey: string) =>
  `<!-- ingest-blog:supportUnitKey=${supportUnitKey} -->`

export const parseSupportUnitClaim = (body: string | null | undefined) =>
  body?.match(supportUnitClaimPattern)?.[1] ?? null

export const hasSupportUnitClaim = ({
  pullRequests,
  supportUnitKey,
}: {
  pullRequests: PullRequestClaimSource[]
  supportUnitKey: string
}) => pullRequests.some((pullRequest) => parseSupportUnitClaim(pullRequest.body) === supportUnitKey)

export const createFailureBlockLabel = (failureBlockHash: string) =>
  `failure-block:${failureBlockHash}`

const parserSupportTitlePrefix = "[Parser Support]"

export const createParserSupportPrTitle = (title: string) =>
  `${parserSupportTitlePrefix} ${
    title.startsWith(parserSupportTitlePrefix)
      ? title.slice(parserSupportTitlePrefix.length).trimStart()
      : title
  }`
