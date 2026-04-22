import { writeUtf8, repoPath } from "./lib/paths.js"
import { buildGeneratedDocs } from "./lib/report-generation.js"

const run = async () => {
  const generated = await buildGeneratedDocs()

  await writeUtf8({
    targetPath: repoPath(".agents", "knowledge", "architecture", "parser-block-catalog.md"),
    content: generated.parserBlockCatalog,
  })
  await writeUtf8({
    targetPath: repoPath(".agents", "knowledge", "product", "sample-corpus.md"),
    content: generated.sampleCorpusDoc,
  })
  await writeUtf8({
    targetPath: repoPath(".agents", "knowledge", "reference", "generated", "quality-score.md"),
    content: generated.qualityScore,
  })
  await writeUtf8({
    targetPath: repoPath(".agents", "knowledge", "reference", "generated", "sample-coverage.md"),
    content: generated.sampleCoverage,
  })

  console.log(
    "quality:report updated parser/sample knowledge docs and generated coverage reports",
  )
}

void run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
