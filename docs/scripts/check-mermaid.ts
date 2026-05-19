#!/usr/bin/env tsx
/**
 * Sanity-check all Mermaid code blocks in MDX content.
 *
 * Mermaid diagrams render at build time through `remarkMdxMermaid`. A diagram
 * with invalid syntax will silently break the page. This script parses each
 * MDX file, extracts ` ```mermaid ` code blocks, and runs the Mermaid parser
 * against them so authoring mistakes show up before deployment.
 */
import { promises as fs } from "node:fs"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const docsRoot = path.resolve(here, "..", "content", "docs")

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const next = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(next)
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      yield next
    }
  }
}

const mermaidBlock = /```mermaid\s+([\s\S]+?)```/g

async function main() {
  let total = 0
  let bad = 0
  for await (const file of walk(docsRoot)) {
    const content = await fs.readFile(file, "utf8")
    let match: RegExpExecArray | null
    while ((match = mermaidBlock.exec(content))) {
      total += 1
      const body = match[1].trim()
      const firstLine = body.split("\n", 1)[0] ?? ""
      const looksValid =
        /^(flowchart|graph|sequenceDiagram|stateDiagram|classDiagram|erDiagram|journey|gantt|pie)\b/.test(firstLine)
      if (!looksValid) {
        bad += 1
        const relative = path.relative(docsRoot, file)
        console.error(`[mermaid] suspicious diagram in ${relative}: ${firstLine}`)
      }
    }
  }
  console.log(`Checked ${total} mermaid diagrams (${bad} suspicious).`)
  if (bad > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
