import { createHash } from "node:crypto"

const safeKeySegment = (value: string) => {
  const segment = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return segment || "unknown"
}

const normalizeClassName = (className: string | null | undefined) => {
  const classes = (className ?? "")
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .sort()

  if (classes.length === 0) {
    return "no-class"
  }

  return safeKeySegment(classes.join("-"))
}

const createShortHash = (value: string) =>
  createHash("sha1").update(value).digest("hex").slice(0, 8)

export const createSupportUnit = ({
  editorType,
  firstUnsupportedTag,
  firstUnsupportedClassName,
  firstUnsupportedModuleType,
}: {
  editorType: string | null
  firstUnsupportedTag: string | null
  firstUnsupportedClassName: string | null
  firstUnsupportedModuleType: string | null
}) => {
  const editorSegment = safeKeySegment(editorType ?? "unknown-editor")
  const moduleType = firstUnsupportedModuleType ? safeKeySegment(firstUnsupportedModuleType) : null
  const tagSegment = safeKeySegment(firstUnsupportedTag ?? "unknown-tag")
  const classSegment = normalizeClassName(firstUnsupportedClassName)
  const supportUnitBaseKey =
    editorType === "naver-se4" && moduleType
      ? `${editorSegment}:${moduleType}`
      : `${editorSegment}:${tagSegment}:${classSegment}`
  const failureBlockHash = createShortHash(supportUnitBaseKey)
  const supportUnitKey =
    editorType === "naver-se4" && moduleType
      ? supportUnitBaseKey
      : `${supportUnitBaseKey}:${failureBlockHash}`

  return {
    supportUnitKey,
    failureBlockHash,
  }
}
