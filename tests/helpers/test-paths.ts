import { tmpdir } from "node:os"
import path from "node:path"

const testRunRoot = path.join(tmpdir(), `goodbye-naver-blog-tests-${process.pid}`)

export const createTestPath = (...segments: string[]) => path.join(testRunRoot, ...segments)

