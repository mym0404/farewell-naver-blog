// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import "@testing-library/jest-dom/vitest"

import { markdownShowcase } from "../fixtures/markdown-showcase.js"
import { MarkdownDocument, splitFrontmatter } from "../../src/ui/lib/markdown.js"

describe("MarkdownDocument", () => {
  it("splits frontmatter and keeps body content separate", () => {
    const result = splitFrontmatter(`---
title: demo
tags:
  - one
---

# Heading`)

    expect(result.frontmatter).toEqual({
      title: "demo",
      tags: ["one"],
    })
    expect(result.body).toContain("# Heading")
  })

  it("renders structured markdown and omits raw html blocks", () => {
    render(
      <MarkdownDocument markdown={`${markdownShowcase}\n<div>hidden html</div>`} />,
    )

    expect(screen.getByText("Frontmatter")).toBeInTheDocument()
    expect(screen.getByText("postTitle:")).toBeInTheDocument()
    expect(screen.getByText("테스트 글")).toBeInTheDocument()
    expect(screen.getByRole("table")).toBeInTheDocument()
    expect(screen.getByText(/parser note/)).toBeInTheDocument()
    expect(document.querySelector("pre code")?.textContent).toContain("const value = 1")
    expect(document.querySelector(".hljs-keyword")).not.toBeNull()
    expect(screen.queryByText("hidden html")).not.toBeInTheDocument()
  })
})
