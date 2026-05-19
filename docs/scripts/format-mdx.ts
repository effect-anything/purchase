#!/usr/bin/env tsx
/**
 * Format fenced ```ts / ```tsx / ```js / ```jsx code blocks in MDX files
 * by piping them through oxfmt --stdin-filepath. Only operates on
 * content/docs/**\/*.mdx files.
 */

import { spawnSync } from "node:child_process"
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, "../..")
const docsRoot = resolve(__dirname, "..")
const oxfmtBin = resolve(repoRoot, "node_modules/.bin/oxfmt")

function walk(dir: string, out: Array<string> = []): Array<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.isFile() && entry.name.endsWith(".mdx")) out.push(full)
  }
  return out
}

const FENCE = /^([ \t]*)```(ts|tsx|js|jsx|typescript|javascript)([^\n]*)\n([\s\S]*?)^[ \t]*```/gm

const langToExt: Record<string, string> = {
  ts: "ts",
  typescript: "ts",
  tsx: "tsx",
  js: "js",
  javascript: "js",
  jsx: "jsx"
}

function formatBlock(code: string, ext: string): string | null {
  // oxfmt parses snippets as scripts/modules. Standalone `yield` at the top
  // level is invalid, which causes oxfmt to misparse `yield* x` as `yield * x`.
  // Wrap such snippets in a generator function for parsing, then unwrap.
  const needsGenerator = /(^|[^.\w])yield(\s|\*|;|$)/m.test(code)
  const wrapped = needsGenerator ? `async function* __wrap__() {\n${code}\n}\n` : code
  const result = spawnSync(oxfmtBin, [`--stdin-filepath=snippet.${ext}`], {
    input: wrapped,
    encoding: "utf8"
  })
  if (result.status !== 0) {
    process.stderr.write(`oxfmt failed:\n${result.stderr}\n--- input ---\n${code}\n`)
    return null
  }
  let out = result.stdout
  if (needsGenerator) {
    const match = out.match(/^async function\* __wrap__\(\) \{\n([\s\S]*)\n\}\s*$/)
    if (!match) {
      process.stderr.write(`failed to unwrap formatted snippet\n--- formatted ---\n${out}\n`)
      return null
    }
    // Strip the single level of indentation oxfmt added inside the function.
    out =
      match[1]
        .split("\n")
        .map((l) => (l.startsWith("  ") ? l.slice(2) : l))
        .join("\n") + "\n"
  }
  return out
}

function stripIndent(block: string, indent: string): { stripped: string; ok: boolean } {
  if (indent.length === 0) return { stripped: block, ok: true }
  const lines = block.split("\n")
  const out: Array<string> = []
  for (const line of lines) {
    if (line.length === 0) {
      out.push(line)
      continue
    }
    if (!line.startsWith(indent)) return { stripped: block, ok: false }
    out.push(line.slice(indent.length))
  }
  return { stripped: out.join("\n"), ok: true }
}

function reindent(code: string, indent: string): string {
  if (indent.length === 0) return code
  return code
    .split("\n")
    .map((line) => (line.length > 0 ? indent + line : line))
    .join("\n")
}

let changedFiles = 0
let totalBlocks = 0
let formattedBlocks = 0

const files = walk(resolve(docsRoot, "content/docs"))

for (const file of files) {
  const original = readFileSync(file, "utf8")
  let changed = false
  const next = original.replace(FENCE, (match, indent: string, lang: string, info: string, body: string) => {
    totalBlocks++
    const ext = langToExt[lang.toLowerCase()]
    if (!ext) return match
    // Body excludes trailing newline before closing fence already due to regex
    const { stripped, ok } = stripIndent(body, indent)
    if (!ok) return match
    const formatted = formatBlock(stripped, ext)
    if (formatted == null) return match
    const trimmed = formatted.replace(/\n+$/, "")
    const reindented = reindent(trimmed, indent)
    formattedBlocks++
    const replacement = `${indent}\`\`\`${lang}${info}\n${reindented}\n${indent}\`\`\``
    if (replacement !== match) changed = true
    return replacement
  })
  if (changed) {
    writeFileSync(file, next)
    changedFiles++
    process.stdout.write(`formatted ${file.slice(docsRoot.length + 1)}\n`)
  }
}

process.stdout.write(`\nfiles changed: ${changedFiles}, blocks formatted: ${formattedBlocks}/${totalBlocks}\n`)
