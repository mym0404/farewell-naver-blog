import { tmpdir } from "node:os"
import path from "node:path"

const testRunRoot = path.join(tmpdir(), `farewell-naver-blog-tests-${process.pid}`)

export const createTestPath = (...segments: string[]) => path.join(testRunRoot, ...segments)

