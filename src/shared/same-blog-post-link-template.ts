import type { ExportOptions, PostSummary } from "./types.js"
import { getDateSlug, sanitizePathSegment, slugifyTitle } from "./path-format.js"

export const sameBlogPostTemplateKeys = [
  "slug",
  "category",
  "title",
  "logNo",
  "blogId",
  "date",
  "year",
  "month",
  "day",
] as const

export type SameBlogPostTemplateKey = (typeof sameBlogPostTemplateKeys)[number]

export type SameBlogPostTemplateValues = Record<SameBlogPostTemplateKey, string>

const sameBlogPostTemplatePattern = /\{(slug|category|title|logNo|blogId|date|year|month|day)\}/g

const buildPostSlug = ({
  title,
  options,
}: {
  title: string
  options: Pick<ExportOptions, "structure">
}) => (options.structure.slugStyle === "keep-title" ? sanitizePathSegment(title) : slugifyTitle(title))

const toReadablePathToken = (value: string) => sanitizePathSegment(value).replace(/\s+/g, "-")

export const buildSameBlogPostTemplateValues = ({
  post,
  options,
}: {
  post: Pick<PostSummary, "blogId" | "logNo" | "title" | "publishedAt"> & {
    categoryName?: string
  }
  options: Pick<ExportOptions, "structure">
}) => {
  const date = getDateSlug(post.publishedAt)
  const [year = "", month = "", day = ""] = date.split("-")

  return {
    slug: buildPostSlug({
      title: post.title,
      options,
    }),
    category: toReadablePathToken(post.categoryName?.trim() || "uncategorized"),
    title: toReadablePathToken(post.title),
    logNo: post.logNo,
    blogId: post.blogId,
    date,
    year,
    month,
    day,
  } satisfies SameBlogPostTemplateValues
}

export const applySameBlogPostCustomUrlTemplate = ({
  template,
  values,
}: {
  template: string
  values: SameBlogPostTemplateValues
}) => template.replace(sameBlogPostTemplatePattern, (_, key: SameBlogPostTemplateKey) => values[key])
