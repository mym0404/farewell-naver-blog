import type {
  ExportOptions,
  FrontmatterFieldName,
} from "./types.js"

export const frontmatterFieldOrder: FrontmatterFieldName[] = [
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

export const defaultExportOptions = (): ExportOptions => ({
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
  },
  markdown: {
    linkStyle: "inlined",
    linkCardStyle: "inline",
    formulaStyle: "double-dollar",
    tableStyle: "gfm-or-html",
    videoStyle: "thumbnail-link",
    imageStyle: "markdown-image",
    imageGroupStyle: "split-images",
    rawHtmlPolicy: "keep",
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

export const cloneExportOptions = (options?: Partial<ExportOptions>) => {
  const defaults = defaultExportOptions()

  return {
    scope: {
      ...defaults.scope,
      ...options?.scope,
      categoryIds: options?.scope?.categoryIds ?? defaults.scope.categoryIds,
    },
    structure: {
      ...defaults.structure,
      ...options?.structure,
    },
    frontmatter: {
      enabled: options?.frontmatter?.enabled ?? defaults.frontmatter.enabled,
      fields: {
        ...defaults.frontmatter.fields,
        ...options?.frontmatter?.fields,
      },
    },
    markdown: {
      ...defaults.markdown,
      ...options?.markdown,
    },
    assets: {
      ...defaults.assets,
      ...options?.assets,
    },
  } satisfies ExportOptions
}
