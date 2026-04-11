import type {
  ExportOptions,
  FrontmatterFieldMeta,
  FrontmatterFieldName,
} from "./types.js"

export type PartialExportOptions = {
  scope?: Partial<ExportOptions["scope"]>
  structure?: Partial<ExportOptions["structure"]>
  frontmatter?: {
    enabled?: boolean
    fields?: Partial<Record<FrontmatterFieldName, boolean>>
    aliases?: Partial<Record<FrontmatterFieldName, string>>
  }
  markdown?: Partial<ExportOptions["markdown"]>
  assets?: Partial<ExportOptions["assets"]>
}

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

export const frontmatterFieldMeta: Record<FrontmatterFieldName, FrontmatterFieldMeta> = {
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

export const frontmatterAliasPattern = /^[A-Za-z_][A-Za-z0-9_-]*$/

export const getFrontmatterExportKey = ({
  fieldName,
  alias,
}: {
  fieldName: FrontmatterFieldName
  alias: string
}) => alias.trim() || fieldName

export const validateFrontmatterAliases = ({
  enabled,
  fields,
  aliases,
}: ExportOptions["frontmatter"]) => {
  if (!enabled) {
    return []
  }

  const aliasOwners = new Map<string, FrontmatterFieldName>()
  const errors: string[] = []

  for (const fieldName of frontmatterFieldOrder) {
    if (!fields[fieldName]) {
      continue
    }

    const alias = aliases[fieldName]?.trim() ?? ""
    const exportKey = getFrontmatterExportKey({
      fieldName,
      alias,
    })

    if (alias && !frontmatterAliasPattern.test(alias)) {
      errors.push(
        `${fieldName} alias는 영문자 또는 _로 시작하고 영문자, 숫자, -, _만 사용할 수 있습니다.`,
      )
      continue
    }

    const existingOwner = aliasOwners.get(exportKey)

    if (existingOwner) {
      errors.push(`${existingOwner}와 ${fieldName}가 같은 alias "${exportKey}"를 사용하고 있습니다.`)
      continue
    }

    aliasOwners.set(exportKey, fieldName)
  }

  return errors
}

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
    aliases: {
      title: "",
      source: "",
      blogId: "",
      logNo: "",
      publishedAt: "",
      category: "",
      categoryPath: "",
      editorVersion: "",
      visibility: "",
      tags: "",
      thumbnail: "",
      video: "",
      warnings: "",
      exportedAt: "",
      assetPaths: "",
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

export const cloneExportOptions = (options?: PartialExportOptions) => {
  const defaults = defaultExportOptions()

  const clonedOptions = {
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
      aliases: {
        ...defaults.frontmatter.aliases,
        ...options?.frontmatter?.aliases,
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

  const frontmatterErrors = validateFrontmatterAliases(clonedOptions.frontmatter)

  if (frontmatterErrors.length > 0) {
    throw new Error(frontmatterErrors.join(" "))
  }

  return clonedOptions
}
