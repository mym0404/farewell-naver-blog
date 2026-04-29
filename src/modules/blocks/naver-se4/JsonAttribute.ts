import type { UnknownRecord } from "../../../shared/Types.js"

export const parseJsonAttribute = (value: string | undefined) => {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as UnknownRecord
  } catch {
    return null
  }
}
