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
    include: [
      "tests/parser/naver-se2/**/*.test.ts",
      "tests/parser/naver-se3/**/*.test.ts",
      "tests/parser/naver-se4/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      include: [
        "src/modules/blocks/common/**/*.ts",
        "src/modules/blocks/naver-se2/**/*.ts",
        "src/modules/blocks/naver-se3/**/*.ts",
        "src/modules/blocks/naver-se4/**/*.ts",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})

