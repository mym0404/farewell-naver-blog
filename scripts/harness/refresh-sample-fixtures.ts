import { NaverBlogFetcher } from "../../src/modules/blog-fetcher/NaverBlogFetcher.js"
import { sampleCorpus } from "./lib/sample-corpus.js"
import { renderSampleFixture, writeSampleFixture } from "./lib/sample-fixtures.js"

const parseArgs = (argv: string[]) => {
  const idFlagIndex = argv.indexOf("--id")
  const requestedId = idFlagIndex >= 0 ? argv[idFlagIndex + 1] ?? null : null
  const refreshAll = argv.includes("--all")

  if (requestedId && refreshAll) {
    throw new Error("--id 와 --all 은 동시에 사용할 수 없습니다.")
  }

  if (!requestedId && !refreshAll) {
    throw new Error("Usage: pnpm samples:refresh -- --id <sampleId> | --all")
  }

  return {
    requestedId,
    refreshAll,
  }
}

const run = async () => {
  const { requestedId, refreshAll } = parseArgs(process.argv.slice(2))
  const targets = refreshAll
    ? sampleCorpus
    : sampleCorpus.filter((sample) => sample.id === requestedId)

  if (targets.length === 0) {
    throw new Error(`sample not found: ${requestedId}`)
  }

  const fetchers = new Map<string, NaverBlogFetcher>()

  for (const sample of targets) {
    const fetcher =
      fetchers.get(sample.blogId) ??
      new NaverBlogFetcher({
        blogId: sample.blogId,
      })
    fetchers.set(sample.blogId, fetcher)

    const html = await fetcher.fetchPostHtml(sample.logNo)
    const rendered = await renderSampleFixture({
      sample,
      html,
    })

    await writeSampleFixture({
      sample,
      html,
      markdown: rendered.normalizedMarkdown,
    })

    console.log(`samples:refresh updated ${sample.id}`)
  }
}

void run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
