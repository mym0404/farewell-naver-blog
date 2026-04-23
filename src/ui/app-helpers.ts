import type {
  ExportJobState,
  ExportOptions,
  ExportResumeSummary,
  ScanResult,
  ThemePreference,
} from "../shared/types.js"
import type { PartialExportOptions } from "../shared/export-options.js"
import { sanitizePersistedExportOptions } from "../shared/export-options.js"
import { DEFAULT_OUTPUT_DIR } from "../shared/export-defaults.js"
import { isUploadActionableJob, JOB_STATUSES } from "../shared/export-job-state.js"

export const defaultOutputDir = DEFAULT_OUTPUT_DIR
export const defaultScanStatus = "블로그를 아직 스캔하지 않았습니다."
export const defaultCategoryStatus = "스캔 후 카테고리를 선택할 수 있습니다."
export const restoredScanStatus = "이전 작업 상태를 복구했습니다."
export const restoredCategoryStatus = "이전 작업 상태를 복구했습니다."
export const restoredCategoryFallbackStatus = "복구된 작업 상태를 확인하세요."
export const readyCategoryStatus = "내보낼 카테고리를 선택하세요."
export const resumeLookupErrorStatus = "작업 상태 확인에 실패했습니다. 다시 시도하세요."
export const defaultScanLoadingStatus = "카테고리를 스캔하는 중입니다."
export const forceScanLoadingStatus = "캐시를 무효화하고 카테고리를 다시 불러오는 중입니다."

export const normalizeOutputDir = (value: string) => value.trim() || defaultOutputDir

export const getPersistedUiStateSignature = ({
  options,
  themePreference,
}: {
  options: ExportOptions | PartialExportOptions
  themePreference: ThemePreference
}) =>
  JSON.stringify({
    options: sanitizePersistedExportOptions(options),
    themePreference,
  })

export type ResumeDialogState = {
  source: "bootstrap" | "before-scan"
  resumedJob: ExportJobState
  resumeSummary: ExportResumeSummary
  resumedScanResult: ScanResult | null
}

export const resolveScopedCategoryIds = ({
  categories,
  currentCategoryIds,
}: {
  categories: ScanResult["categories"]
  currentCategoryIds: number[]
}) => {
  const validCategoryIds = currentCategoryIds.filter((categoryId) =>
    categories.some((category) => category.id === categoryId),
  )

  return validCategoryIds.length > 0
    ? validCategoryIds
    : categories.map((category) => category.id)
}

export const shouldLoadUploadProviders = (job: ExportJobState | null) => isUploadActionableJob(job)

export const resolveWizardStep = ({
  setupStep,
  jobStatus,
  submitting,
  uploadSubmitting,
}: {
  setupStep: string
  jobStatus: ExportJobState["status"] | undefined
  submitting: boolean
  uploadSubmitting: boolean
}) => {
  if (submitting || jobStatus === "queued" || jobStatus === "running") {
    return "running"
  }

  if (
    uploadSubmitting ||
    jobStatus === JOB_STATUSES.UPLOAD_READY ||
    jobStatus === JOB_STATUSES.UPLOADING ||
    jobStatus === JOB_STATUSES.UPLOAD_FAILED
  ) {
    return "upload"
  }

  if (
    jobStatus === JOB_STATUSES.COMPLETED ||
    jobStatus === JOB_STATUSES.FAILED ||
    jobStatus === JOB_STATUSES.UPLOAD_COMPLETED
  ) {
    return "result"
  }

  return setupStep
}

export const buildSummaryCards = ({
  currentStep,
  job,
  scopedPostCount,
  activeCategoryCount,
  selectedCount,
  outputDir,
}: {
  currentStep: string
  job: ExportJobState | null
  scopedPostCount: number
  activeCategoryCount: number
  selectedCount: number
  outputDir: string
}) => {
  if (currentStep === "running" || currentStep === "upload" || currentStep === "result") {
    const total = job?.progress.total ?? scopedPostCount

    return [
      { label: "총 글", value: String(total) },
      { label: "완료", value: String(job?.progress.completed ?? 0) },
      { label: "실패", value: String(job?.progress.failed ?? 0) },
      { label: "업로드", value: String(job?.upload.uploadedCount ?? 0) },
    ]
  }

  return [
    { label: "대상 글", value: String(scopedPostCount) },
    { label: "카테고리", value: String(activeCategoryCount) },
    { label: "선택", value: String(selectedCount) },
    { label: "출력", value: normalizeOutputDir(outputDir) },
  ]
}

export const getHeaderStatus = ({
  job,
  scanPending,
  activeScanResult,
}: {
  job: ExportJobState | null
  scanPending: boolean
  activeScanResult: ScanResult | null
}) => {
  if (job?.status) {
    return job.status
  }

  if (scanPending) {
    return "running"
  }

  if (activeScanResult) {
    return "ready"
  }

  return "idle"
}

export const getNextButtonLabel = ({
  setupStep,
  scanPending,
  submitting,
}: {
  setupStep: string
  scanPending: boolean
  submitting: boolean
}) => {
  switch (setupStep) {
    case "blog-input":
      return scanPending ? "스캔 중" : "카테고리 불러오기"
    case "category-selection":
      return "구조 설정"
    case "structure-options":
      return "Frontmatter 설정"
    case "frontmatter-options":
      return "Markdown 설정"
    case "markdown-options":
      return "Assets 설정"
    case "assets-options":
      return "Link 처리"
    case "links-options":
      return "진단 설정"
    case "diagnostics-options":
      return submitting ? "작업 등록 중" : "내보내기"
    default:
      return ""
  }
}
