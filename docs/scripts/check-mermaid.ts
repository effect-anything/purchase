import { renderMermaidSVG } from "beautiful-mermaid"
import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"

const files = execSync("find content/docs -name '*.mdx'", {
  encoding: "utf8"
})
  .trim()
  .split("\n")
  .filter(Boolean)

let failed = false

for (const file of files) {
  const source = readFileSync(file, "utf8")
  const charts = source.matchAll(/<Mermaid chart=\{`\n([\s\S]*?)\n`\} \/>/g)

  for (const chart of charts) {
    try {
      const svg = renderMermaidSVG(chart[1].trim(), { transparent: true })

      if (!svg.includes("<svg")) {
        throw new Error("No SVG output")
      }
    } catch (cause) {
      failed = true
      console.error(`${file}: ${cause instanceof Error ? cause.message : String(cause)}`)
    }
  }
}

if (failed) {
  process.exit(1)
}
