const blogIdInput = document.querySelector("#blogIdOrUrl")
const outputDirInput = document.querySelector("#outputDir")
const scanButton = document.querySelector("#scan-button")
const exportButton = document.querySelector("#export-button")
const scanStatus = document.querySelector("#scan-status")
const categoryStatus = document.querySelector("#category-status")
const scanSummaryNode = document.querySelector("#scan-summary")
const categoryListNode = document.querySelector("#category-list")
const categorySearchInput = document.querySelector("#category-search")
const selectAllCategoriesButton = document.querySelector("#select-all-categories")
const clearAllCategoriesButton = document.querySelector("#clear-all-categories")
const selectedCategoryCountNode = document.querySelector("#selected-category-count")
const frontmatterFieldsNode = document.querySelector("#frontmatter-fields")
const statusText = document.querySelector("#status-text")
const summaryNode = document.querySelector("#summary")
const logsNode = document.querySelector("#logs")

let defaults = null
let scanResult = null
let activeJobId = null
let pollingHandle = null

const frontmatterFieldLabels = {
  title: "title",
  source: "source",
  blogId: "blogId",
  logNo: "logNo",
  publishedAt: "publishedAt",
  category: "category",
  categoryPath: "categoryPath",
  editorVersion: "editorVersion",
  visibility: "visibility",
  tags: "tags",
  thumbnail: "thumbnail",
  video: "video",
  warnings: "warnings",
  exportedAt: "exportedAt",
  assetPaths: "assetPaths",
}

const setStatus = (value) => {
  statusText.textContent = value
}

const setSummary = (job) => {
  if (!job) {
    summaryNode.innerHTML = ""
    return
  }

  const progress = job.progress ?? {
    total: 0,
    completed: 0,
    failed: 0,
    warnings: 0,
  }

  summaryNode.innerHTML = `
    <div class="stat-card"><span>Total</span><strong>${progress.total}</strong></div>
    <div class="stat-card"><span>Completed</span><strong>${progress.completed}</strong></div>
    <div class="stat-card"><span>Failed</span><strong>${progress.failed}</strong></div>
    <div class="stat-card"><span>Warnings</span><strong>${progress.warnings}</strong></div>
    ${job.manifest ? `<div class="stat-note">manifest.json generated for ${job.manifest.blogId}</div>` : ""}
    ${job.error ? `<div class="stat-note error">${job.error}</div>` : ""}
  `
}

const setLogs = (logs) => {
  logsNode.textContent = logs.map((log) => `[${log.timestamp}] ${log.message}`).join("\n")
}

const stopPolling = () => {
  if (pollingHandle) {
    clearInterval(pollingHandle)
    pollingHandle = null
  }
}

const collectSelectedCategoryIds = () =>
  Array.from(categoryListNode.querySelectorAll('input[type="checkbox"]:checked')).map((input) =>
    Number(input.value),
  )

const updateSelectedCategoryCount = () => {
  const selectedCount = collectSelectedCategoryIds().length

  selectedCategoryCountNode.textContent = `선택된 카테고리 ${selectedCount}개`
}

const renderScanSummary = () => {
  if (!scanResult) {
    scanSummaryNode.innerHTML = ""
    return
  }

  scanSummaryNode.innerHTML = `
    <div class="stat-card"><span>Blog ID</span><strong>${scanResult.blogId}</strong></div>
    <div class="stat-card"><span>Total Posts</span><strong>${scanResult.totalPostCount}</strong></div>
    <div class="stat-card"><span>Categories</span><strong>${scanResult.categories.length}</strong></div>
  `
}

const renderCategoryList = () => {
  if (!scanResult) {
    categoryListNode.className = "category-list empty"
    categoryListNode.textContent = "카테고리를 불러오면 여기에 표시됩니다."
    return
  }

  const keyword = categorySearchInput.value.trim().toLowerCase()
  const categories = scanResult.categories.filter((category) => {
    if (!keyword) {
      return true
    }

    const haystack = `${category.path.join(" / ")} ${category.name}`.toLowerCase()

    return haystack.includes(keyword)
  })

  if (categories.length === 0) {
    categoryListNode.className = "category-list empty"
    categoryListNode.textContent = "검색 결과가 없습니다."
    return
  }

  categoryListNode.className = "category-list"
  categoryListNode.innerHTML = categories
    .map(
      (category) => `
        <label class="category-item" style="--depth:${category.depth}">
          <input type="checkbox" value="${category.id}" checked />
          <span class="category-label">${category.path.join(" / ")}</span>
          <span class="category-count">${category.postCount}</span>
        </label>
      `,
    )
    .join("")

  categoryListNode.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.addEventListener("change", updateSelectedCategoryCount)
  })

  updateSelectedCategoryCount()
}

const disableCategorySelection = () => {
  exportButton.disabled = true
  categorySearchInput.disabled = true
  selectAllCategoriesButton.disabled = true
  clearAllCategoriesButton.disabled = true
  categoryStatus.textContent = "스캔 후 카테고리를 선택할 수 있습니다."
  scanResult = null
  renderScanSummary()
  renderCategoryList()
}

const buildOptionsPayload = () => ({
  scope: {
    categoryIds: collectSelectedCategoryIds(),
    categoryMode: document.querySelector("#scope-categoryMode").value,
    dateFrom: document.querySelector("#scope-dateFrom").value || null,
    dateTo: document.querySelector("#scope-dateTo").value || null,
  },
  structure: {
    cleanOutputDir: document.querySelector("#structure-cleanOutputDir").checked,
    postDirectoryName: document.querySelector("#structure-postDirectoryName").value.trim() || "posts",
    assetDirectoryName: document.querySelector("#structure-assetDirectoryName").value.trim() || "assets",
    folderStrategy: document.querySelector("#structure-folderStrategy").value,
    includeDateInFilename: document.querySelector("#structure-includeDateInFilename").checked,
    includeLogNoInFilename: document.querySelector("#structure-includeLogNoInFilename").checked,
    slugStyle: document.querySelector("#structure-slugStyle").value,
  },
  frontmatter: {
    enabled: document.querySelector("#frontmatter-enabled").checked,
    fields: Object.fromEntries(
      Array.from(frontmatterFieldsNode.querySelectorAll('input[type="checkbox"]')).map((input) => [
        input.value,
        input.checked,
      ]),
    ),
  },
  markdown: {
    linkStyle: document.querySelector("#markdown-linkStyle").value,
    linkCardStyle: document.querySelector("#markdown-linkCardStyle").value,
    formulaStyle: document.querySelector("#markdown-formulaStyle").value,
    tableStyle: document.querySelector("#markdown-tableStyle").value,
    videoStyle: document.querySelector("#markdown-videoStyle").value,
    imageStyle: document.querySelector("#markdown-imageStyle").value,
    imageGroupStyle: document.querySelector("#markdown-imageGroupStyle").value,
    rawHtmlPolicy: document.querySelector("#markdown-rawHtmlPolicy").value,
    dividerStyle: document.querySelector("#markdown-dividerStyle").value,
    codeFenceStyle: document.querySelector("#markdown-codeFenceStyle").value,
    headingLevelOffset: Number(document.querySelector("#markdown-headingLevelOffset").value || "0"),
  },
  assets: {
    assetPathMode: document.querySelector("#assets-assetPathMode").value,
    downloadImages: document.querySelector("#assets-downloadImages").checked,
    downloadThumbnails: document.querySelector("#assets-downloadThumbnails").checked,
    includeImageCaptions: document.querySelector("#assets-includeImageCaptions").checked,
    thumbnailSource: document.querySelector("#assets-thumbnailSource").value,
  },
})

const applyDefaults = () => {
  if (!defaults) {
    return
  }

  const { options } = defaults

  document.querySelector("#scope-categoryMode").value = options.scope.categoryMode
  document.querySelector("#scope-dateFrom").value = options.scope.dateFrom ?? ""
  document.querySelector("#scope-dateTo").value = options.scope.dateTo ?? ""
  document.querySelector("#structure-cleanOutputDir").checked = options.structure.cleanOutputDir
  document.querySelector("#structure-postDirectoryName").value = options.structure.postDirectoryName
  document.querySelector("#structure-assetDirectoryName").value = options.structure.assetDirectoryName
  document.querySelector("#structure-folderStrategy").value = options.structure.folderStrategy
  document.querySelector("#structure-includeDateInFilename").checked = options.structure.includeDateInFilename
  document.querySelector("#structure-includeLogNoInFilename").checked = options.structure.includeLogNoInFilename
  document.querySelector("#structure-slugStyle").value = options.structure.slugStyle
  document.querySelector("#frontmatter-enabled").checked = options.frontmatter.enabled
  document.querySelector("#markdown-linkStyle").value = options.markdown.linkStyle
  document.querySelector("#markdown-linkCardStyle").value = options.markdown.linkCardStyle
  document.querySelector("#markdown-formulaStyle").value = options.markdown.formulaStyle
  document.querySelector("#markdown-tableStyle").value = options.markdown.tableStyle
  document.querySelector("#markdown-videoStyle").value = options.markdown.videoStyle
  document.querySelector("#markdown-imageStyle").value = options.markdown.imageStyle
  document.querySelector("#markdown-imageGroupStyle").value = options.markdown.imageGroupStyle
  document.querySelector("#markdown-rawHtmlPolicy").value = options.markdown.rawHtmlPolicy
  document.querySelector("#markdown-dividerStyle").value = options.markdown.dividerStyle
  document.querySelector("#markdown-codeFenceStyle").value = options.markdown.codeFenceStyle
  document.querySelector("#markdown-headingLevelOffset").value = String(options.markdown.headingLevelOffset)
  document.querySelector("#assets-assetPathMode").value = options.assets.assetPathMode
  document.querySelector("#assets-downloadImages").checked = options.assets.downloadImages
  document.querySelector("#assets-downloadThumbnails").checked = options.assets.downloadThumbnails
  document.querySelector("#assets-includeImageCaptions").checked = options.assets.includeImageCaptions
  document.querySelector("#assets-thumbnailSource").value = options.assets.thumbnailSource

  frontmatterFieldsNode.innerHTML = defaults.frontmatterFieldOrder
    .map((fieldName) => {
      const checked = options.frontmatter.fields[fieldName] ? "checked" : ""

      return `
        <label class="check">
          <input type="checkbox" value="${fieldName}" ${checked} />
          <span>${frontmatterFieldLabels[fieldName] ?? fieldName}</span>
        </label>
      `
    })
    .join("")
}

const pollJob = async () => {
  if (!activeJobId) {
    return
  }

  const response = await fetch(`/api/export/${activeJobId}`)
  const job = await response.json()

  setStatus(job.status)
  setSummary(job)
  setLogs(job.logs)

  if (job.status === "completed" || job.status === "failed") {
    exportButton.disabled = false
    stopPolling()
  }
}

const loadDefaults = async () => {
  const response = await fetch("/api/export-defaults")
  defaults = await response.json()
  applyDefaults()
}

scanButton.addEventListener("click", async () => {
  const blogIdOrUrl = blogIdInput.value.trim()

  if (!blogIdOrUrl) {
    scanStatus.textContent = "blog ID 또는 URL을 입력해야 합니다."
    return
  }

  scanButton.disabled = true
  scanStatus.textContent = "카테고리를 스캔하는 중입니다."
  categoryStatus.textContent = "카테고리를 불러오는 중입니다."

  try {
    const response = await fetch("/api/scan", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        blogIdOrUrl,
      }),
    })
    const body = await response.json()

    if (!response.ok) {
      throw new Error(body.error ?? "scan failed")
    }

    scanResult = body
    scanStatus.textContent = `${body.blogId} 스캔 완료`
    categoryStatus.textContent = "export 할 카테고리를 선택하세요."
    categorySearchInput.disabled = false
    selectAllCategoriesButton.disabled = false
    clearAllCategoriesButton.disabled = false
    exportButton.disabled = false
    renderScanSummary()
    renderCategoryList()
  } catch (error) {
    disableCategorySelection()
    scanStatus.textContent = error instanceof Error ? error.message : String(error)
  } finally {
    scanButton.disabled = false
  }
})

blogIdInput.addEventListener("input", () => {
  disableCategorySelection()
  scanStatus.textContent = "블로그가 변경되었습니다. 다시 스캔해야 합니다."
})

categorySearchInput.addEventListener("input", renderCategoryList)

selectAllCategoriesButton.addEventListener("click", () => {
  categoryListNode.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.checked = true
  })
  updateSelectedCategoryCount()
})

clearAllCategoriesButton.addEventListener("click", () => {
  categoryListNode.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.checked = false
  })
  updateSelectedCategoryCount()
})

document.querySelector("#export-form").addEventListener("submit", async (event) => {
  event.preventDefault()

  if (!scanResult) {
    categoryStatus.textContent = "먼저 스캔을 완료해야 합니다."
    return
  }

  stopPolling()
  exportButton.disabled = true
  setStatus("queued")
  setSummary(null)
  setLogs([])

  const response = await fetch("/api/export", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      blogIdOrUrl: blogIdInput.value.trim(),
      outputDir: outputDirInput.value.trim(),
      options: buildOptionsPayload(),
    }),
  })
  const body = await response.json()

  if (!response.ok) {
    exportButton.disabled = false
    setStatus("failed")
    setSummary({
      progress: {
        total: 0,
        completed: 0,
        failed: 0,
        warnings: 0,
      },
      error: body.error ?? "request failed",
    })
    return
  }

  activeJobId = body.jobId
  await pollJob()
  pollingHandle = setInterval(pollJob, 1000)
})

await loadDefaults()
disableCategorySelection()
