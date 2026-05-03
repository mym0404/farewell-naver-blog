import path from "node:path"
import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

const rootDir = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(rootDir, "src/ui"),
      "@shared": path.join(rootDir, "src/shared"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      include: [
        "src/modules/**/*.ts",
        "src/shared/ExportOptions.ts",
        "src/shared/Utils.ts",
        "src/ui/**/*.ts",
        "src/ui/**/*.tsx",
      ],
      exclude: [
        "src/modules/blog-fetcher/**",
        "src/modules/exporter/ExportPreview.ts",
        "src/ui/Main.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "tests/**",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 75,
        statements: 90,
        "src/modules/blocks/common/**/*.ts": { 100: true },
        "src/modules/blocks/naver-se2/**/*.ts": { 100: true },
        "src/modules/blocks/naver-se3/**/*.ts": { 100: true },
        "src/modules/blocks/naver-se4/**/*.ts": { 100: true },
      },
    },
  },
})
