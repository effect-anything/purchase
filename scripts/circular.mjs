import * as glob from "glob"
import madge from "madge"

madge(
  glob.globSync(
    [
      "packages/*/src/**/*.ts",
      "docs/**/*.ts",
      "docs/**/*.tsx",
      "examples/nextjs/**/*.ts",
      "examples/nextjs/**/*.tsx"
    ],
    {
      ignore: ["docs/.source"]
    }
  ),
  {
    detectiveOptions: {
      ts: {
        skipTypeImports: true
      }
    }
  }
).then((res) => {
  const circular = res.circular()
  if (circular.length) {
    console.error("Circular dependencies found")
    console.error(circular)
    process.exit(1)
  }
})
