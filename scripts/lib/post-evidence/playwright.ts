import type { Browser, ElementHandle, Locator, Page } from "playwright"

const mobileViewport = {
  width: 390,
  height: 844,
}

const userAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

const rendererViewport = {
  width: 960,
  height: 720,
}

const markdownViewerGlobalStateKey = "markdownViewerGlobalState"
const markdownViewerDarkThemeState = JSON.stringify({
  theme: "dark",
})

export const createEvidenceBrowserContext = async (browser: Browser) =>
  browser.newContext({
    viewport: mobileViewport,
    userAgent,
  })

const naverMobilePostUrl = ({
  blogId,
  logNo,
}: {
  blogId: string
  logNo: string
}) => `https://m.blog.naver.com/PostView.naver?blogId=${encodeURIComponent(blogId)}&logNo=${encodeURIComponent(logNo)}`

const captureElementNode = async ({
  element,
  outputPath,
}: {
  element: ElementHandle
  outputPath: string
}) => {
  await element.evaluate((node) => {
    if (!(node instanceof Element)) {
      return
    }

    node.scrollIntoView({
      block: "start",
      inline: "nearest",
    })
  })
  await element.screenshot({ path: outputPath })
}

const measureLocatorContent = async (locator: Locator) =>
  locator.evaluate((node) => {
    const rootRect = node.getBoundingClientRect()
    const descendants = [node, ...Array.from(node.querySelectorAll("*"))]
    let right = rootRect.right
    let bottom = rootRect.bottom

    for (const descendant of descendants) {
      const rect = descendant.getBoundingClientRect()

      if (rect.width === 0 && rect.height === 0) {
        continue
      }

      right = Math.max(right, rect.right)
      bottom = Math.max(bottom, rect.bottom)
    }

    return {
      width: Math.ceil(Math.max(rootRect.width, right - rootRect.left)),
      height: Math.ceil(Math.max(rootRect.height, bottom - rootRect.top)),
    }
  })

const captureExpandedMarkdownPreview = async ({
  page,
  preview,
  outputPath,
}: {
  page: Page
  preview: Locator
  outputPath: string
}) => {
  const size = await measureLocatorContent(preview)
  await page.setViewportSize({
    width: Math.max(rendererViewport.width, size.width + 40),
    height: Math.max(rendererViewport.height, size.height + 40),
  })

  await page.screenshot({
    path: outputPath,
    clip: {
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
    },
    style: `
      html,
      body {
        margin: 0 !important;
        overflow: visible !important;
      }

      #markdown-preview {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        z-index: 2147483647 !important;
        width: ${size.width}px !important;
        max-width: none !important;
        max-height: none !important;
        overflow: visible !important;
      }
    `,
  })
}

export const captureNaverPost = async ({
  browser,
  blogId,
  logNo,
  editorType,
  inspectPath,
  outputPath,
}: {
  browser: Browser
  blogId: string
  logNo: string
  editorType: string | null
  inspectPath?: string
  outputPath: string
}) => {
  const context = await createEvidenceBrowserContext(browser)
  const page = await context.newPage()

  try {
    await page.goto(naverMobilePostUrl({ blogId, logNo }), {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    })
    await page.locator("#viewTypeSelector").first().waitFor({
      state: "attached",
      timeout: 15_000,
    })

    if (!inspectPath) {
      await page.locator("#viewTypeSelector").first().screenshot({ path: outputPath })
      return
    }

    const handle = await page.evaluateHandle(
      ({ path, type }) => {
        const roots =
          type === "naver-se4"
            ? Array.from(document.querySelectorAll("#viewTypeSelector .se-component"))
            : type === "naver-se3"
              ? Array.from(document.querySelectorAll("#viewTypeSelector .se_component_wrap.sect_dsc .se_component"))
              : Array.from(document.querySelector("#viewTypeSelector")?.childNodes ?? [])
        const indexes = path.split(".").map((part) => Number(part))
        let node: Node | undefined = roots[indexes[0] ?? -1]

        for (const index of indexes.slice(1)) {
          node = node?.childNodes[index]
        }

        if (!node) {
          return null
        }

        return node.nodeType === Node.ELEMENT_NODE
          ? node
          : node.parentElement
      },
      {
        path: inspectPath,
        type: editorType,
      },
    )
    const element = handle.asElement()

    if (!element) {
      throw new Error(`inspect path element not found: ${inspectPath}`)
    }

    await captureElementNode({
      element,
      outputPath,
    })
  } finally {
    await context.close()
  }
}

export const captureRenderer = async ({
  browser,
  rendererUrl,
  outputPath,
}: {
  browser: Browser
  rendererUrl: string
  outputPath: string
}) => {
  const context = await browser.newContext({
    viewport: rendererViewport,
  })
  await context.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value)
    },
    {
      key: markdownViewerGlobalStateKey,
      value: markdownViewerDarkThemeState,
    },
  )
  const page = await context.newPage()

  try {
    await page.goto(rendererUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    })
    await page.locator("body").waitFor({
      state: "attached",
      timeout: 5_000,
    })
    const preview = page.locator("#markdown-preview").first()
    await preview.waitFor({
      state: "visible",
      timeout: 10_000,
    })
    await page.waitForTimeout(1_000)

    await captureExpandedMarkdownPreview({
      page,
      preview,
      outputPath,
    })
  } finally {
    await context.close()
  }
}
