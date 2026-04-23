import type { ExportJobState, ExportResumeSummary, ScanResult } from "../../../shared/types.js"

export type ResumeDialogState = {
  source: "bootstrap" | "before-scan"
  resumedJob: ExportJobState
  resumeSummary: ExportResumeSummary
  resumedScanResult: ScanResult | null
}
