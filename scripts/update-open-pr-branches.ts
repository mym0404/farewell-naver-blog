#!/usr/bin/env bun
import { execFile } from "node:child_process"
import { promisify } from "node:util"

type PullRequest = {
  number: number
  title: string
  headRefName: string
  baseRefName: string
  isDraft: boolean
  mergeable: string
  mergeStateStatus: string
  url: string
}

type Args = {
  dryRun: boolean
  limit: number
  repo?: string
}

const execFileAsync = promisify(execFile)

const usage = () => `Usage:
  bun scripts/update-open-pr-branches.ts [--dry-run] [--repo owner/name] [--limit 100]

Options:
  --dry-run       List open PRs that would be updated without calling gh pr update-branch.
  --repo <repo>   GitHub repository in owner/name format. Defaults to the current repo.
  --limit <n>     Maximum number of open PRs to inspect. Defaults to 100.`

const toRecord = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined

const toErrorMessage = (error: unknown) => {
  const record = toRecord(error)
  const stderr = record && typeof record.stderr === "string" ? record.stderr.trim() : ""
  const stdout = record && typeof record.stdout === "string" ? record.stdout.trim() : ""

  return stderr || stdout || (error instanceof Error ? error.message : String(error))
}

const readValue = (args: string[], index: number) => {
  const value = args[index + 1]

  if (!value || value.startsWith("--")) {
    throw new Error(usage())
  }

  return value
}

const parseArgs = (args: string[]): Args | "help" => {
  let dryRun = false
  let limit = 100
  let repo: string | undefined

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]

    if (arg === "--help" || arg === "-h") {
      return "help"
    }

    if (arg === "--dry-run") {
      dryRun = true
      continue
    }

    if (arg === "--repo") {
      repo = readValue(args, index)
      index++
      continue
    }

    if (arg === "--limit") {
      const parsedLimit = Number(readValue(args, index))

      if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
        throw new Error("--limit must be a positive integer.")
      }

      limit = parsedLimit
      index++
      continue
    }

    throw new Error(usage())
  }

  return {
    dryRun,
    limit,
    ...(repo ? { repo } : {}),
  }
}

const ghRepoArgs = (repo: string | undefined) => (repo ? ["--repo", repo] : [])

const runGh = async (args: string[]) => {
  const { stdout, stderr } = await execFileAsync("gh", args, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  })

  return {
    stdout,
    stderr,
  }
}

const loadOpenPullRequests = async ({ limit, repo }: { limit: number; repo?: string }) => {
  const { stdout } = await runGh([
    "pr",
    "list",
    "--state",
    "open",
    "--limit",
    String(limit),
    "--json",
    "number,title,headRefName,baseRefName,isDraft,mergeable,mergeStateStatus,url",
    ...ghRepoArgs(repo),
  ])

  return JSON.parse(stdout) as PullRequest[]
}

const formatPullRequest = (pullRequest: PullRequest) =>
  `#${pullRequest.number} ${pullRequest.title} (${pullRequest.headRefName} -> ${pullRequest.baseRefName}, ${pullRequest.mergeStateStatus})`

const updatePullRequestBranch = async ({
  pullRequest,
  repo,
}: {
  pullRequest: PullRequest
  repo?: string
}) => {
  const result = await runGh([
    "pr",
    "update-branch",
    String(pullRequest.number),
    ...ghRepoArgs(repo),
  ])
  const output = [result.stdout.trim(), result.stderr.trim()].filter(Boolean).join("\n")

  if (output) {
    console.log(output)
  }
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))

  if (args === "help") {
    console.log(usage())
    return
  }

  const pullRequests = await loadOpenPullRequests(args)

  if (pullRequests.length === 0) {
    console.log("No open PRs found.")
    return
  }

  console.log(`Found ${pullRequests.length} open PR(s).`)

  const failures: Array<{ pullRequest: PullRequest; error: string }> = []

  for (const pullRequest of pullRequests) {
    console.log(`${args.dryRun ? "Would update" : "Updating"} ${formatPullRequest(pullRequest)}`)

    if (args.dryRun) {
      continue
    }

    try {
      await updatePullRequestBranch({
        pullRequest,
        repo: args.repo,
      })
    } catch (error) {
      failures.push({
        pullRequest,
        error: toErrorMessage(error),
      })
    }
  }

  if (failures.length > 0) {
    console.error(`Failed to update ${failures.length} PR(s):`)

    for (const failure of failures) {
      console.error(`- ${formatPullRequest(failure.pullRequest)}: ${failure.error}`)
    }

    process.exitCode = 1
    return
  }

  console.log(args.dryRun ? "Dry run completed." : "All open PR branches were updated.")
}

try {
  await main()
} catch (error) {
  console.error(toErrorMessage(error))
  process.exitCode = 2
}
