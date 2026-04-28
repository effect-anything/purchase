/// <reference types="bun" />

import fs from "node:fs"
import path from "node:path"

const repoRoot = path.resolve(import.meta.dirname, "..")
const distDir = path.join(repoRoot, "dist")

fs.rmSync(distDir, { force: true, recursive: true })
fs.rmSync(path.join(repoRoot, "tsconfig.tsbuildinfo"), { force: true })
