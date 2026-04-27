import { defineConfig } from "vitest/config"

export default defineConfig({
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
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 75,
        statements: 90,
      },
    },
  },
})
