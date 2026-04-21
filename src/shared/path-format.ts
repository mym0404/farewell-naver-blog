const invalidPathCharacterPattern = /[<>:"/\\|?*\u0000-\u001f]/g
const leadingDashPattern = /^-\s*/
const multipleDashPattern = /-+/g
const multipleWhitespacePattern = /\s+/g

export const sanitizeCategoryName = (value: string) =>
  value.replace(leadingDashPattern, "").trim()

export const sanitizePathSegment = (value: string) => {
  const cleaned = sanitizeCategoryName(value)
    .replace(invalidPathCharacterPattern, " ")
    .replace(multipleWhitespacePattern, " ")
    .trim()

  return cleaned || "untitled"
}

export const slugifyTitle = (value: string) => {
  const slug = sanitizePathSegment(value)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(multipleDashPattern, "-")
    .replace(/^-|-$/g, "")

  return slug || "post"
}

export const getDateSlug = (isoDateTime: string) => isoDateTime.slice(0, 10)
