import ReactMarkdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import rehypeHighlight from "rehype-highlight"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import YAML from "yaml"

import { cn } from "./cn.js"

const frontmatterPattern = /^---\s*\n([\s\S]*?)\n---\s*\n?/

const katexTagNames = [
  "annotation",
  "annotation-xml",
  "maction",
  "math",
  "menclose",
  "mfrac",
  "mi",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "ms",
  "mspace",
  "msqrt",
  "mstyle",
  "msub",
  "msubsup",
  "msup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "semantics",
]

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), ...katexTagNames],
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ["className"]],
    div: [...(defaultSchema.attributes?.div ?? []), ["className"]],
    pre: [...(defaultSchema.attributes?.pre ?? []), ["className"]],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ["className"],
      ["style"],
      ["ariaHidden"],
    ],
    math: [["xmlns"]],
    annotation: [["encoding"]],
  },
}

type FrontmatterRecord = Record<string, unknown>

const normalizeFrontmatterValue = (value: unknown) => {
  if (Array.isArray(value) || (value && typeof value === "object")) {
    return YAML.stringify(value).trim()
  }

  if (value === null || value === undefined || value === "") {
    return "-"
  }

  return String(value)
}

export const splitFrontmatter = (markdown: string) => {
  const match = markdown.match(frontmatterPattern)

  if (!match) {
    return {
      frontmatter: null,
      body: markdown,
    }
  }

  let frontmatter: FrontmatterRecord | null = null

  try {
    const parsed = YAML.parse(match[1])

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      frontmatter = parsed as FrontmatterRecord
    }
  } catch {
    frontmatter = {
      raw: match[1].trim(),
    }
  }

  return {
    frontmatter,
    body: markdown.slice(match[0].length),
  }
}

export const MarkdownDocument = ({
  markdown,
  className,
}: {
  markdown: string
  className?: string
}) => {
  const { frontmatter, body } = splitFrontmatter(markdown)

  return (
    <div
      className={cn(
        "markdown-document space-y-5 text-[0.96rem] leading-7 text-slate-700",
        "[&_.markdown-frontmatter]:mb-6 [&_.markdown-frontmatter]:grid [&_.markdown-frontmatter]:gap-3 [&_.markdown-frontmatter]:rounded-[1.5rem] [&_.markdown-frontmatter]:border [&_.markdown-frontmatter]:border-slate-200 [&_.markdown-frontmatter]:bg-slate-50 [&_.markdown-frontmatter]:p-4",
        "[&_.markdown-frontmatter-label]:text-[11px] [&_.markdown-frontmatter-label]:font-semibold [&_.markdown-frontmatter-label]:uppercase [&_.markdown-frontmatter-label]:tracking-[0.18em] [&_.markdown-frontmatter-label]:text-slate-500",
        "[&_.markdown-frontmatter-grid]:grid [&_.markdown-frontmatter-grid]:gap-3",
        "[&_.markdown-frontmatter-item]:grid [&_.markdown-frontmatter-item]:gap-2 md:[&_.markdown-frontmatter-item]:grid-cols-[minmax(7rem,9rem)_minmax(0,1fr)]",
        "[&_.markdown-frontmatter-key]:text-sm [&_.markdown-frontmatter-key]:font-semibold [&_.markdown-frontmatter-key]:text-slate-500",
        "[&_.markdown-frontmatter-item_pre]:m-0 [&_.markdown-frontmatter-item_pre]:w-full [&_.markdown-frontmatter-item_pre]:overflow-auto [&_.markdown-frontmatter-item_pre]:rounded-2xl [&_.markdown-frontmatter-item_pre]:bg-slate-950 [&_.markdown-frontmatter-item_pre]:px-4 [&_.markdown-frontmatter-item_pre]:py-3 [&_.markdown-frontmatter-item_pre]:font-mono [&_.markdown-frontmatter-item_pre]:text-sm [&_.markdown-frontmatter-item_pre]:leading-7 [&_.markdown-frontmatter-item_pre]:text-slate-50",
        "[&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-[-0.05em] [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.04em] [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-[-0.03em]",
        "[&_p]:text-[0.96rem] [&_p]:leading-7 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_li]:leading-7",
        "[&_blockquote]:my-4 [&_blockquote]:rounded-r-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-accent/70 [&_blockquote]:px-4 [&_blockquote]:py-3",
        "[&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-2xl [&_table]:border [&_table]:border-slate-200 [&_th]:bg-slate-100 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border-t [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2",
        "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
        "[&_code]:rounded-md [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-slate-900",
        "[&_pre]:overflow-auto [&_pre]:rounded-[1.25rem] [&_pre]:bg-slate-950 [&_pre]:px-4 [&_pre]:py-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-7 [&_pre]:text-slate-50 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-50",
        "[&_.hljs-keyword]:text-sky-300 [&_.hljs-selector-tag]:text-sky-300 [&_.hljs-literal]:text-sky-300 [&_.hljs-title\\.function_]:text-sky-300 [&_.hljs-built_in]:text-sky-300",
        "[&_.hljs-string]:text-lime-300 [&_.hljs-attr]:text-lime-300 [&_.hljs-template-variable]:text-lime-300",
        "[&_.hljs-number]:text-amber-300 [&_.hljs-symbol]:text-amber-300 [&_.hljs-bullet]:text-amber-300",
        "[&_.hljs-comment]:text-slate-400 [&_.hljs-quote]:text-slate-400 [&_.hljs-meta]:text-pink-300 [&_.hljs-section]:text-pink-300",
        className,
      )}
    >
      {frontmatter ? (
        <section className="markdown-frontmatter">
          <div className="markdown-frontmatter-label">Frontmatter</div>
          <div className="markdown-frontmatter-grid">
            {Object.entries(frontmatter).map(([key, value]) => (
              <article key={key} className="markdown-frontmatter-item">
                <span className="markdown-frontmatter-key">{key}:</span>
                <pre>{normalizeFrontmatterValue(value)}</pre>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight, [rehypeSanitize, sanitizeSchema]]}
        skipHtml
        components={{
          a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
          code: ({ className: codeClassName, children, ...props }) => (
            <code className={codeClassName} {...props}>
              {children}
            </code>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  )
}
