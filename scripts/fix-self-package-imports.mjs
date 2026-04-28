import * as Fs from "node:fs"
import * as Path from "node:path"
import * as Process from "node:process"
import * as Glob from "glob"
import * as Ts from "typescript"

const supportedExtensions = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]
const ignoredDirectories = ["node_modules", "dist", "build", "coverage", ".turbo", ".next"]

const cliArgs = Process.argv.slice(2)
const writeMode = cliArgs.includes("--write")
const rootArgs = cliArgs.filter((arg) => !arg.startsWith("--"))
const searchRoots = rootArgs.length > 0 ? rootArgs.map((arg) => Path.resolve(arg)) : [Process.cwd()]

const packageRoots = discoverPackageRoots(searchRoots)
const findings = packageRoots.flatMap((packageRoot) => collectPackageFindings(packageRoot))

if (findings.length === 0) {
  console.log("No self-package imports found")
  Process.exit(0)
}

if (writeMode) {
  applyFindings(findings)
  console.log(`Rewrote ${findings.length} self-package import${findings.length === 1 ? "" : "s"}`)
  Process.exit(0)
}

for (const finding of findings) {
  const relativeFile = normalizeSlashes(Path.relative(Process.cwd(), finding.filePath) || finding.filePath)
  console.log(`${relativeFile}:${finding.line}:${finding.column} ${finding.source} -> ${finding.replacement}`)
}

Process.exit(1)

function discoverPackageRoots(searchRoots) {
  const roots = new Set()

  for (const searchRoot of searchRoots) {
    const resolvedRoot = Fs.statSync(searchRoot).isDirectory() ? searchRoot : Path.dirname(searchRoot)

    if (isPackageRoot(resolvedRoot)) {
      roots.add(resolvedRoot)
      continue
    }

    for (const packageJsonPath of Glob.globSync(["packages/*/package.json", "packages/*/*/package.json"], {
      cwd: resolvedRoot,
      absolute: true
    })) {
      const packageRoot = Path.dirname(packageJsonPath)
      if (isPackageRoot(packageRoot)) {
        roots.add(packageRoot)
      }
    }
  }

  return [...roots]
}

function isPackageRoot(directory) {
  return Fs.existsSync(Path.join(directory, "package.json")) && Fs.existsSync(Path.join(directory, "src"))
}

function collectPackageFindings(packageRoot) {
  const packageJson = JSON.parse(Fs.readFileSync(Path.join(packageRoot, "package.json"), "utf8"))
  if (typeof packageJson.name !== "string" || packageJson.name.length === 0) {
    return []
  }

  const filePaths = Glob.globSync("**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}", {
    cwd: packageRoot,
    absolute: true,
    ignore: ignoredDirectories.map((directory) => `**/${directory}/**`)
  }).filter((filePath) => !filePath.endsWith(".d.ts"))

  return filePaths.flatMap((filePath) => collectFileFindings(filePath, packageRoot, packageJson.name))
}

function collectFileFindings(filePath, packageRoot, packageName) {
  const sourceText = Fs.readFileSync(filePath, "utf8")
  const sourceFile = Ts.createSourceFile(filePath, sourceText, Ts.ScriptTarget.Latest, true, getScriptKind(filePath))
  const findings = []

  visit(sourceFile)

  return findings

  function visit(node) {
    const moduleSpecifier = getModuleSpecifier(node)
    if (moduleSpecifier !== undefined) {
      const source = moduleSpecifier.text
      const targetFile = resolveSelfPackageTarget(packageRoot, packageName, source)

      if (targetFile !== undefined && normalizeSlashes(targetFile) !== normalizeSlashes(filePath)) {
        const replacement = toRelativeImport(filePath, targetFile)
        if (replacement !== source) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(moduleSpecifier.getStart(sourceFile))
          findings.push({
            filePath,
            line: line + 1,
            column: character + 1,
            source,
            replacement,
            start: moduleSpecifier.getStart(sourceFile),
            end: moduleSpecifier.getEnd()
          })
        }
      }
    }

    Ts.forEachChild(node, visit)
  }
}

function getModuleSpecifier(node) {
  if (Ts.isImportDeclaration(node) || Ts.isExportDeclaration(node)) {
    if (node.moduleSpecifier !== undefined && Ts.isStringLiteral(node.moduleSpecifier)) {
      return node.moduleSpecifier
    }
  }

  return undefined
}

function resolveSelfPackageTarget(packageRoot, packageName, source) {
  if (isRelativeImport(source)) {
    return undefined
  }

  if (source !== packageName && !source.startsWith(`${packageName}/`)) {
    return undefined
  }

  const packageSubpath = source === packageName ? "index" : source.slice(packageName.length + 1)
  const basePath = Path.join(packageRoot, "src", packageSubpath)

  if (hasSupportedExtension(basePath) && Fs.existsSync(basePath)) {
    return basePath
  }

  for (const extension of supportedExtensions) {
    const filePath = `${basePath}${extension}`
    if (Fs.existsSync(filePath)) {
      return filePath
    }
  }

  for (const extension of supportedExtensions) {
    const filePath = Path.join(basePath, `index${extension}`)
    if (Fs.existsSync(filePath)) {
      return filePath
    }
  }

  return undefined
}

function isRelativeImport(source) {
  return source.startsWith("./") || source.startsWith("../")
}

function hasSupportedExtension(filePath) {
  return supportedExtensions.some((extension) => filePath.endsWith(extension))
}

function toRelativeImport(fromFile, targetFile) {
  const relativePath = normalizeSlashes(Path.relative(Path.dirname(fromFile), targetFile))
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`
}

function normalizeSlashes(filePath) {
  return filePath.replaceAll(Path.sep, "/")
}

function getScriptKind(filePath) {
  if (filePath.endsWith(".tsx")) {
    return Ts.ScriptKind.TSX
  }
  if (filePath.endsWith(".jsx")) {
    return Ts.ScriptKind.JSX
  }
  if (filePath.endsWith(".cts")) {
    return Ts.ScriptKind.CTS
  }
  if (filePath.endsWith(".cjs")) {
    return Ts.ScriptKind.JS
  }
  if (filePath.endsWith(".mts")) {
    return Ts.ScriptKind.MTS
  }
  if (filePath.endsWith(".mjs")) {
    return Ts.ScriptKind.JS
  }
  if (filePath.endsWith(".js")) {
    return Ts.ScriptKind.JS
  }
  return Ts.ScriptKind.TS
}

function applyFindings(findings) {
  const findingsByFile = new Map()

  for (const finding of findings) {
    const fileFindings = findingsByFile.get(finding.filePath)
    if (fileFindings === undefined) {
      findingsByFile.set(finding.filePath, [finding])
    } else {
      fileFindings.push(finding)
    }
  }

  for (const [filePath, fileFindings] of findingsByFile) {
    const sourceText = Fs.readFileSync(filePath, "utf8")
    const nextText = fileFindings
      .toSorted((left, right) => right.start - left.start)
      .reduce(
        (text, finding) => `${text.slice(0, finding.start)}"${finding.replacement}"${text.slice(finding.end)}`,
        sourceText
      )
    Fs.writeFileSync(filePath, nextText)
  }
}
