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
const frontmatterStatusNode = document.querySelector("#frontmatter-status")
const statusText = document.querySelector("#status-text")
const summaryNode = document.querySelector("#summary")
const logsNode = document.querySelector("#logs")
const previewButton = document.querySelector("#preview-button")
const previewStatusNode = document.querySelector("#preview-status")
const previewMetaNode = document.querySelector("#preview-meta")
const previewMarkdownNode = document.querySelector("#preview-markdown")

let defaults = null
let scanResult = null
let activeJobId = null
let pollingHandle = null
let frontmatterValidationErrors = []
let previewDirty = true

const frontmatterDefaultStatusText = "각 필드의 설명과 export key alias를 여기서 조정합니다."

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

const frontmatterFieldOrder = [
  "title",
  "source",
  "blogId",
  "logNo",
  "publishedAt",
  "category",
  "categoryPath",
  "editorVersion",
  "visibility",
  "tags",
  "thumbnail",
  "video",
  "warnings",
  "exportedAt",
  "assetPaths",
]

const frontmatterFieldMetaFallback = {
  title: {
    label: "title",
    description: "글 제목을 기록합니다.",
    defaultAlias: "title",
  },
  source: {
    label: "source",
    description: "원본 네이버 글 URL을 기록합니다.",
    defaultAlias: "source",
  },
  blogId: {
    label: "blogId",
    description: "블로그 식별자를 기록합니다.",
    defaultAlias: "blogId",
  },
  logNo: {
    label: "logNo",
    description: "네이버 글 번호를 숫자로 기록합니다.",
    defaultAlias: "logNo",
  },
  publishedAt: {
    label: "publishedAt",
    description: "발행 시각을 ISO 문자열로 기록합니다.",
    defaultAlias: "publishedAt",
  },
  category: {
    label: "category",
    description: "현재 카테고리 이름을 기록합니다.",
    defaultAlias: "category",
  },
  categoryPath: {
    label: "categoryPath",
    description: "상위 카테고리 경로를 배열로 기록합니다.",
    defaultAlias: "categoryPath",
  },
  editorVersion: {
    label: "editorVersion",
    description: "파싱된 에디터 버전을 기록합니다.",
    defaultAlias: "editorVersion",
  },
  visibility: {
    label: "visibility",
    description: "현재 export visibility를 기록합니다.",
    defaultAlias: "visibility",
  },
  tags: {
    label: "tags",
    description: "본문에서 읽은 태그 목록을 기록합니다.",
    defaultAlias: "tags",
  },
  thumbnail: {
    label: "thumbnail",
    description: "대표 썸네일 경로 또는 URL을 기록합니다.",
    defaultAlias: "thumbnail",
  },
  video: {
    label: "video",
    description: "추출된 비디오 메타데이터를 기록합니다.",
    defaultAlias: "video",
  },
  warnings: {
    label: "warnings",
    description: "렌더링 중 발생한 경고 목록을 기록합니다.",
    defaultAlias: "warnings",
  },
  exportedAt: {
    label: "exportedAt",
    description: "export 시각을 ISO 문자열로 기록합니다.",
    defaultAlias: "exportedAt",
  },
  assetPaths: {
    label: "assetPaths",
    description: "생성된 자산 경로 목록을 기록합니다.",
    defaultAlias: "assetPaths",
  },
}

const createDefaultOptionsFallback = () => ({
  scope: {
    categoryIds: [],
    categoryMode: "selected-and-descendants",
    dateFrom: null,
    dateTo: null,
  },
  structure: {
    cleanOutputDir: true,
    postDirectoryName: "posts",
    assetDirectoryName: "assets",
    folderStrategy: "category-path",
    includeDateInFilename: true,
    includeLogNoInFilename: true,
    slugStyle: "kebab",
  },
  frontmatter: {
    enabled: true,
    fields: {
      title: true,
      source: true,
      blogId: true,
      logNo: true,
      publishedAt: true,
      category: true,
      categoryPath: true,
      editorVersion: true,
      visibility: true,
      tags: true,
      thumbnail: true,
      video: true,
      warnings: true,
      exportedAt: true,
      assetPaths: false,
    },
    aliases: Object.fromEntries(frontmatterFieldOrder.map((fieldName) => [fieldName, ""])),
  },
  markdown: {
    linkStyle: "inlined",
    linkCardStyle: "inline",
    formulaStyle: "double-dollar",
    tableStyle: "gfm-or-html",
    videoStyle: "thumbnail-link",
    imageStyle: "markdown-image",
    imageGroupStyle: "split-images",
    rawHtmlPolicy: "omit",
    dividerStyle: "dash",
    codeFenceStyle: "backtick",
    headingLevelOffset: 0,
  },
  assets: {
    assetPathMode: "relative",
    downloadImages: true,
    downloadThumbnails: true,
    includeImageCaptions: true,
    thumbnailSource: "post-list-first",
  },
})

const frontmatterAliasPattern = /^[A-Za-z_][A-Za-z0-9_-]*$/

const setExportAvailability = () => {
  exportButton.disabled = !scanResult || frontmatterValidationErrors.length > 0
  previewButton.disabled = !scanResult || frontmatterValidationErrors.length > 0
}

const setStatus = (value) => {
  statusText.textContent = value
  statusText.dataset.status = value
}

const setSummary = (job) => {
  if (!job) {
    summaryNode.innerHTML = `
      <div class="stat-card"><span>Status</span><strong>Ready</strong></div>
      <div class="stat-card"><span>Completed</span><strong>0</strong></div>
      <div class="stat-card"><span>Failed</span><strong>0</strong></div>
      <div class="stat-card"><span>Warnings</span><strong>0</strong></div>
    `
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
  logsNode.textContent =
    logs.length === 0
      ? "작업 로그가 여기에 표시됩니다."
      : logs.map((log) => `[${log.timestamp}] ${log.message}`).join("\n")
}

const resetPreview = ({
  status,
  meta = "preview 대상 글 정보가 여기에 표시됩니다.",
  markdown = "아직 preview가 없습니다.",
} = {}) => {
  previewStatusNode.textContent =
    status ??
    "스캔 후 카테고리를 고르면 현재 선택 범위의 대표 글을 기준으로 예시 Markdown을 확인할 수 있습니다."
  previewMetaNode.className = "preview-meta empty"
  previewMetaNode.textContent = meta
  previewMarkdownNode.textContent = markdown
  previewDirty = true
}

const markPreviewDirty = (status = "옵션이 바뀌었습니다. export 전에 예시 Markdown을 다시 확인하세요.") => {
  previewStatusNode.textContent = status
  previewDirty = true
}

const setFrontmatterStatus = () => {
  if (!frontmatterStatusNode) {
    return
  }

  if (frontmatterValidationErrors.length === 0) {
    frontmatterStatusNode.textContent = frontmatterDefaultStatusText
    frontmatterStatusNode.dataset.state = "default"
    return
  }

  frontmatterStatusNode.textContent = frontmatterValidationErrors.join(" ")
  frontmatterStatusNode.dataset.state = "error"
}

const stopPolling = () => {
  if (pollingHandle) {
    clearInterval(pollingHandle)
    pollingHandle = null
  }
}

const getFrontmatterRows = () => Array.from(frontmatterFieldsNode.querySelectorAll("[data-frontmatter-field]"))

const syncFrontmatterAliasDisabledState = () => {
  const frontmatterEnabled = document.querySelector("#frontmatter-enabled").checked

  getFrontmatterRows().forEach((row) => {
    const checkbox = row.querySelector('input[type="checkbox"]')
    const aliasInput = row.querySelector('input[data-alias-input="true"]')

    if (!(checkbox instanceof HTMLInputElement) || !(aliasInput instanceof HTMLInputElement)) {
      return
    }

    aliasInput.disabled = !frontmatterEnabled || !checkbox.checked
  })
}

const validateFrontmatterAliases = () => {
  const frontmatterEnabled = document.querySelector("#frontmatter-enabled").checked
  const aliasOwners = new Map()
  const errors = []
  const errorFields = new Set()

  getFrontmatterRows().forEach((row) => {
    row.dataset.state = "default"
  })

  getFrontmatterRows().forEach((row) => {
    const fieldName = row.dataset.frontmatterField
    const checkbox = row.querySelector('input[type="checkbox"]')
    const aliasInput = row.querySelector('input[data-alias-input="true"]')

    if (
      !fieldName ||
      !(checkbox instanceof HTMLInputElement) ||
      !(aliasInput instanceof HTMLInputElement)
    ) {
      return
    }

    if (!frontmatterEnabled || !checkbox.checked) {
      return
    }

    const alias = aliasInput.value.trim()
    const exportKey = alias || fieldName

    if (alias && !frontmatterAliasPattern.test(alias)) {
      errors.push(`${fieldName} alias는 영문자 또는 _로 시작하고 영문자, 숫자, -, _만 사용할 수 있습니다.`)
      errorFields.add(fieldName)
      return
    }

    const existingOwner = aliasOwners.get(exportKey)

    if (existingOwner) {
      errors.push(`${existingOwner}와 ${fieldName}가 같은 alias "${exportKey}"를 사용하고 있습니다.`)
      errorFields.add(existingOwner)
      errorFields.add(fieldName)
      return
    }

    aliasOwners.set(exportKey, fieldName)
  })

  getFrontmatterRows().forEach((row) => {
    if (row.dataset.frontmatterField && errorFields.has(row.dataset.frontmatterField)) {
      row.dataset.state = "error"
    }
  })

  frontmatterValidationErrors = errors
  setFrontmatterStatus()
  setExportAvailability()
}

const collectSelectedCategoryIds = () =>
  Array.from(categoryListNode.querySelectorAll('input[type="checkbox"]:checked')).map((input) =>
    Number(input.value),
  )

const updateSelectedCategoryCount = () => {
  const selectedCount = collectSelectedCategoryIds().length
  const totalCount = scanResult?.categories.length ?? 0

  selectedCategoryCountNode.textContent = `선택된 카테고리 ${selectedCount}개 / ${totalCount}개`
  renderScanSummary()
  markPreviewDirty()
}

const renderScanSummary = () => {
  if (!scanResult) {
    scanSummaryNode.innerHTML = `
      <article class="metric-card metric-card-primary">
        <span>Blog ID</span>
        <strong>Ready</strong>
        <small>scan 대기 중</small>
      </article>
      <article class="metric-card metric-card-cyan">
        <span>Total Posts</span>
        <strong>0</strong>
        <small>스캔 후 계산됩니다</small>
      </article>
      <article class="metric-card metric-card-green">
        <span>Categories</span>
        <strong>0</strong>
        <small>선택 범위 없음</small>
      </article>
      <article class="metric-card metric-card-neutral">
        <span>Selection</span>
        <strong>0</strong>
        <small>카테고리를 고르면 반영됩니다</small>
      </article>
    `
    return
  }

  const selectedCount = collectSelectedCategoryIds().length || scanResult.categories.length

  scanSummaryNode.innerHTML = `
    <article class="metric-card metric-card-primary">
      <span>Blog ID</span>
      <strong>${scanResult.blogId}</strong>
      <small>scan 완료</small>
    </article>
    <article class="metric-card metric-card-cyan">
      <span>Total Posts</span>
      <strong>${scanResult.totalPostCount}</strong>
      <small>전체 포스트 수</small>
    </article>
    <article class="metric-card metric-card-green">
      <span>Categories</span>
      <strong>${scanResult.categories.length}</strong>
      <small>발견된 카테고리</small>
    </article>
    <article class="metric-card metric-card-neutral">
      <span>Selection</span>
      <strong>${selectedCount}</strong>
      <small>현재 선택 범위</small>
    </article>
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
          <span class="category-meta">
            <span class="category-label">${category.path.join(" / ")}</span>
            <span class="category-subtitle">depth ${category.depth} · posts ${category.postCount}</span>
          </span>
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
  categorySearchInput.disabled = true
  selectAllCategoriesButton.disabled = true
  clearAllCategoriesButton.disabled = true
  categoryStatus.textContent = "스캔 후 카테고리를 선택할 수 있습니다."
  scanResult = null
  selectedCategoryCountNode.textContent = "선택된 카테고리 0개 / 0개"
  renderScanSummary()
  renderCategoryList()
  resetPreview()
  setExportAvailability()
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
    aliases: Object.fromEntries(
      Array.from(frontmatterFieldsNode.querySelectorAll('input[data-alias-input="true"]')).map((input) => [
        input.dataset.fieldName,
        input.value.trim(),
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
    rawHtmlPolicy: "omit",
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

  const options = defaults.options ?? createDefaultOptionsFallback()
  const fieldMetaMap = defaults.frontmatterFieldMeta ?? frontmatterFieldMetaFallback
  const fieldOrder = defaults.frontmatterFieldOrder ?? frontmatterFieldOrder

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
  document.querySelector("#markdown-linkCardStyle").value =
    options.markdown.linkCardStyle === "html" ? "inline" : options.markdown.linkCardStyle
  document.querySelector("#markdown-formulaStyle").value = options.markdown.formulaStyle
  document.querySelector("#markdown-tableStyle").value = "gfm-or-html"
  document.querySelector("#markdown-videoStyle").value =
    options.markdown.videoStyle === "html" ? "thumbnail-link" : options.markdown.videoStyle
  document.querySelector("#markdown-imageStyle").value = options.markdown.imageStyle
  document.querySelector("#markdown-imageGroupStyle").value =
    options.markdown.imageGroupStyle === "html" ? "split-images" : options.markdown.imageGroupStyle
  document.querySelector("#markdown-dividerStyle").value = options.markdown.dividerStyle
  document.querySelector("#markdown-codeFenceStyle").value = options.markdown.codeFenceStyle
  document.querySelector("#markdown-headingLevelOffset").value = String(options.markdown.headingLevelOffset)
  document.querySelector("#assets-assetPathMode").value = options.assets.assetPathMode
  document.querySelector("#assets-downloadImages").checked = options.assets.downloadImages
  document.querySelector("#assets-downloadThumbnails").checked = options.assets.downloadThumbnails
  document.querySelector("#assets-includeImageCaptions").checked = options.assets.includeImageCaptions
  document.querySelector("#assets-thumbnailSource").value = options.assets.thumbnailSource

  frontmatterFieldsNode.innerHTML = fieldOrder
    .map((fieldName) => {
      const checked = options.frontmatter.fields[fieldName] ? "checked" : ""
      const fieldMeta = fieldMetaMap[fieldName]
      const aliasValue = options.frontmatter.aliases[fieldName] ?? ""

      return `
        <div class="frontmatter-row" data-frontmatter-field="${fieldName}">
          <div class="frontmatter-main">
            <label class="frontmatter-toggle">
              <input type="checkbox" value="${fieldName}" ${checked} />
              <span>${fieldMeta?.label ?? frontmatterFieldLabels[fieldName] ?? fieldName}</span>
            </label>
            <p class="frontmatter-description">${fieldMeta?.description ?? ""}</p>
          </div>
          <label class="field frontmatter-alias-field">
            <span>Export Key Alias</span>
            <input
              data-alias-input="true"
              data-field-name="${fieldName}"
              value="${aliasValue}"
              placeholder="${fieldMeta?.defaultAlias ?? fieldName}"
            />
          </label>
        </div>
      `
    })
    .join("")

  frontmatterFieldsNode.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.addEventListener("change", () => {
      syncFrontmatterAliasDisabledState()
      validateFrontmatterAliases()
    })
  })

  frontmatterFieldsNode.querySelectorAll('input[data-alias-input="true"]').forEach((input) => {
    input.addEventListener("input", () => {
      validateFrontmatterAliases()
      markPreviewDirty()
    })
  })

  document.querySelector("#frontmatter-enabled").onchange = () => {
    syncFrontmatterAliasDisabledState()
    validateFrontmatterAliases()
    markPreviewDirty()
  }

  syncFrontmatterAliasDisabledState()
  validateFrontmatterAliases()
}

const renderPreview = (preview) => {
  previewStatusNode.textContent = preview.renderWarnings.length
    ? "preview는 현재 옵션 기준으로 렌더링했습니다. 경고가 있으면 아래 글 요약에서 함께 확인하세요."
    : "preview는 현재 옵션 기준으로 렌더링했습니다. 본문 HTML은 export 결과에 남기지 않습니다."
  previewMetaNode.className = "preview-meta"
  previewMetaNode.innerHTML = `
    <article class="preview-meta-card">
      <span>Candidate Post</span>
      <strong>${preview.candidatePost.title}</strong>
    </article>
    <article class="preview-meta-card">
      <span>Category</span>
      <strong>${preview.candidatePost.categoryName}</strong>
    </article>
    <article class="preview-meta-card">
      <span>Editor</span>
      <strong>SE${preview.editorVersion}</strong>
    </article>
    <article class="preview-meta-card">
      <span>Warnings</span>
      <strong>${preview.parserWarnings.length + preview.reviewerWarnings.length + preview.renderWarnings.length}</strong>
    </article>
  `
  previewMarkdownNode.textContent = preview.markdown
  previewDirty = false
}

const loadPreview = async () => {
  if (!scanResult) {
    resetPreview()
    return
  }

  validateFrontmatterAliases()

  if (frontmatterValidationErrors.length > 0) {
    previewStatusNode.textContent = "Frontmatter alias 오류를 먼저 해결해야 preview를 볼 수 있습니다."
    return
  }

  previewButton.disabled = true
  previewStatusNode.textContent = "대표 글을 가져와 예시 Markdown을 렌더링하는 중입니다."

  try {
    const response = await fetch("/api/preview", {
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
      throw new Error(body.error ?? "preview failed")
    }

    renderPreview(body)
  } catch (error) {
    previewStatusNode.textContent = error instanceof Error ? error.message : String(error)
    previewMetaNode.className = "preview-meta empty"
    previewMetaNode.textContent = "preview 대상 글을 불러오지 못했습니다."
    previewMarkdownNode.textContent = "preview를 생성하지 못했습니다."
    previewDirty = true
  } finally {
    setExportAvailability()
  }
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
    stopPolling()
    setExportAvailability()
  }
}

const loadDefaults = async () => {
  try {
    const response = await fetch("/api/export-defaults")

    if (!response.ok) {
      throw new Error(`defaults request failed: ${response.status}`)
    }

    defaults = await response.json()
  } catch (error) {
    defaults = {
      options: createDefaultOptionsFallback(),
      frontmatterFieldOrder,
      frontmatterFieldMeta: frontmatterFieldMetaFallback,
    }
    scanStatus.textContent = error instanceof Error ? error.message : String(error)
  }

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
    renderScanSummary()
    renderCategoryList()
    resetPreview({
      status: "스캔이 끝났습니다. 현재 선택 범위의 대표 글로 예시 Markdown을 확인할 수 있습니다.",
    })
    setExportAvailability()
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

previewButton.addEventListener("click", loadPreview)

document.querySelector("#export-form").addEventListener("input", (event) => {
  if (event.target === previewButton) {
    return
  }

  if (scanResult && !previewDirty) {
    markPreviewDirty()
  }
})

document.querySelector("#export-form").addEventListener("submit", async (event) => {
  event.preventDefault()

  if (!scanResult) {
    categoryStatus.textContent = "먼저 스캔을 완료해야 합니다."
    return
  }

  validateFrontmatterAliases()

  if (frontmatterValidationErrors.length > 0) {
    categoryStatus.textContent = "Frontmatter alias 오류를 먼저 해결해야 합니다."
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
    setExportAvailability()
    return
  }

  activeJobId = body.jobId
  await pollJob()
  pollingHandle = setInterval(pollJob, 1000)
})

defaults = {
  options: createDefaultOptionsFallback(),
  frontmatterFieldOrder,
  frontmatterFieldMeta: frontmatterFieldMetaFallback,
}
applyDefaults()
await loadDefaults()
disableCategorySelection()
setSummary(null)
setLogs([])
setFrontmatterStatus()
resetPreview()
