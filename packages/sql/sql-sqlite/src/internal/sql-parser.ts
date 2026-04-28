/**
 * A lightweight SQLite query parser that extracts table names and query types.
 * Optimized for performance with caching and minimal regex patterns.
 */

export interface ParsedSql {
  tables: Array<string>
  type: string
}

// Cache for parsed SQL queries
const CACHE_SIZE = 100
const queryCache = new Map<string, ParsedSql>()

type QueryType = "select" | "insert" | "update" | "delete" | "replace" | "create" | "drop" | "alter" | "unknown"

// ParsedSql.type is normalized to lowercase.
const QUERY_TYPES = new Set<QueryType>(["select", "insert", "update", "delete", "replace", "create", "drop", "alter"])

/**
 * Optimized patterns for table name extraction
 * - Supports quoted identifiers (", ', [])
 * - Handles schema prefixes and aliases
 * - Matches SQLite's flexible identifier rules
 */
const PATTERNS = {
  // Base pattern for table names including quotes and brackets
  TABLE: String.raw`(?:"[^"]*"|'[^']*'|\[[^\]]*\]|[a-zA-Z_][a-zA-Z0-9_]*)`,

  // Common SQL patterns
  get FROM() {
    return new RegExp(String.raw`\sFROM\s+(${this.TABLE}(?:\s*,\s*${this.TABLE})*)`, "gi")
  },
  get JOIN() {
    return new RegExp(String.raw`\s(?:LEFT|RIGHT|INNER|OUTER|CROSS|NATURAL)?\s*JOIN\s+(${this.TABLE})`, "gi")
  },
  get UPDATE() {
    return new RegExp(
      String.raw`UPDATE(?:\s+OR\s+(?:ROLLBACK|ABORT|REPLACE|FAIL|IGNORE))?\s+(${this.TABLE}(?:\s*,\s*${this.TABLE})*)`,
      "gi"
    )
  },
  get INSERT() {
    return new RegExp(
      String.raw`INSERT(?:\s+OR\s+(?:ROLLBACK|ABORT|REPLACE|FAIL|IGNORE))?\s+INTO\s+(${this.TABLE})`,
      "gi"
    )
  },
  get CREATE_TABLE() {
    return new RegExp(String.raw`CREATE\s+(?:TEMP|TEMPORARY\s+)?TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(${this.TABLE})`, "gi")
  }
} as const

const skipIgnorable = (sql: string, start: number) => {
  let index = start

  while (index < sql.length) {
    const current = sql[index]
    const next = sql[index + 1]

    if (current && /\s/.test(current)) {
      index += 1
      continue
    }

    if (current === "-" && next === "-") {
      index += 2
      while (index < sql.length && sql[index] !== "\n") {
        index += 1
      }
      continue
    }

    if (current === "/" && next === "*") {
      index += 2
      while (index < sql.length && !(sql[index] === "*" && sql[index + 1] === "/")) {
        index += 1
      }
      index = Math.min(sql.length, index + 2)
      continue
    }

    break
  }

  return index
}

const consumeQuoted = (sql: string, start: number, quoteChar: '"' | "'") => {
  let index = start + 1

  while (index < sql.length) {
    if (sql[index] === quoteChar) {
      if (sql[index + 1] === quoteChar) {
        index += 2
        continue
      }

      return index + 1
    }

    index += 1
  }

  return sql.length
}

const consumeBracketIdentifier = (sql: string, start: number) => {
  let index = start + 1

  while (index < sql.length) {
    if (sql[index] === "]") {
      return index + 1
    }

    index += 1
  }

  return sql.length
}

const consumeBalancedParentheses = (sql: string, start: number) => {
  let index = start
  let depth = 0

  while (index < sql.length) {
    const current = sql[index]
    const next = sql[index + 1]

    if (current === "'") {
      index = consumeQuoted(sql, index, "'")
      continue
    }

    if (current === '"') {
      index = consumeQuoted(sql, index, '"')
      continue
    }

    if (current === "[") {
      index = consumeBracketIdentifier(sql, index)
      continue
    }

    if (current === "-" && next === "-") {
      index += 2
      while (index < sql.length && sql[index] !== "\n") {
        index += 1
      }
      continue
    }

    if (current === "/" && next === "*") {
      index += 2
      while (index < sql.length && !(sql[index] === "*" && sql[index + 1] === "/")) {
        index += 1
      }
      index = Math.min(sql.length, index + 2)
      continue
    }

    if (current === "(") {
      depth += 1
    } else if (current === ")") {
      depth -= 1

      if (depth === 0) {
        return index + 1
      }
    }

    index += 1
  }

  return sql.length
}

const readIdentifier = (sql: string, start: number): { identifier: string; end: number } | undefined => {
  const current = sql[start]

  if (!current) return

  if (current === '"' || current === "'") {
    const end = consumeQuoted(sql, start, current)
    return {
      identifier: sql.slice(start, end),
      end
    }
  }

  if (current === "[") {
    const end = consumeBracketIdentifier(sql, start)
    return {
      identifier: sql.slice(start, end),
      end
    }
  }

  if (!/[A-Za-z_]/.test(current)) {
    return
  }

  let end = start + 1
  while (end < sql.length && /[A-Za-z0-9_]/.test(sql[end] ?? "")) {
    end += 1
  }

  return {
    identifier: sql.slice(start, end),
    end
  }
}

const normalizeIdentifier = (identifier: string) => {
  let normalized = identifier.trim()

  const schemaIndex = normalized.indexOf(".")
  if (schemaIndex !== -1) {
    normalized = normalized.slice(schemaIndex + 1)
  }

  const firstChar = normalized[0]
  const lastChar = normalized[normalized.length - 1]

  if (
    (firstChar === '"' && lastChar === '"') ||
    (firstChar === "'" && lastChar === "'") ||
    (firstChar === "[" && lastChar === "]")
  ) {
    normalized = normalized.slice(1, -1)
  }

  return normalized.split(/\s+(?:AS\s+)?/i)[0] ?? normalized
}

const analyzeWithClause = (sql: string) => {
  const trimmed = sql.trim()
  const cteNames = new Set<string>()
  const withMatch = /^\s*WITH\b/i.exec(trimmed)

  if (!withMatch) {
    return {
      cteNames,
      statementSql: trimmed
    }
  }

  let index = withMatch[0].length
  index = skipIgnorable(trimmed, index)

  const recursiveMatch = /^RECURSIVE\b/i.exec(trimmed.slice(index))
  if (recursiveMatch) {
    index += recursiveMatch[0].length
  }

  while (index < trimmed.length) {
    index = skipIgnorable(trimmed, index)

    const identifier = readIdentifier(trimmed, index)
    if (!identifier) {
      break
    }

    const cteName = normalizeIdentifier(identifier.identifier)
    if (cteName) {
      cteNames.add(cteName)
    }

    index = skipIgnorable(trimmed, identifier.end)

    if (trimmed[index] === "(") {
      index = skipIgnorable(trimmed, consumeBalancedParentheses(trimmed, index))
    }

    const asMatch = /^AS\b/i.exec(trimmed.slice(index))
    if (!asMatch) {
      break
    }
    index = skipIgnorable(trimmed, index + asMatch[0].length)

    const materializedMatch = /^(?:NOT\s+MATERIALIZED|MATERIALIZED)\b/i.exec(trimmed.slice(index))
    if (materializedMatch) {
      index = skipIgnorable(trimmed, index + materializedMatch[0].length)
    }

    if (trimmed[index] !== "(") {
      break
    }

    index = skipIgnorable(trimmed, consumeBalancedParentheses(trimmed, index))

    if (trimmed[index] === ",") {
      index += 1
      continue
    }

    break
  }

  return {
    cteNames,
    statementSql: trimmed.slice(index).trimStart()
  }
}

/**
 * Extracts and normalizes table names from a SQL string using a regex pattern
 * @param sql The SQL query string
 * @param pattern The regex pattern to match table names
 * @returns Array of table names preserving their original case
 */
const extractTableNames = (sql: string, pattern: RegExp): Array<string> => {
  const tables = new Set<string>()
  const matches = sql.matchAll(pattern)

  for (const match of matches) {
    if (!match[1]) continue

    for (const tablePart of match[1].split(",")) {
      const tableName = normalizeIdentifier(tablePart)

      if (tableName) {
        tables.add(tableName)
      }
    }
  }

  return Array.from(tables)
}

/**
 * Gets the query type from a SQL string
 * @param sql The SQL query string
 * @returns The query type or "unknown"
 */
const getQueryType = (sql: string): QueryType => {
  const match = sql.match(/^\s*([A-Za-z]+)/)
  if (!match || !match[1]) return "unknown"

  const firstWord = match[1].toLowerCase() as QueryType
  return QUERY_TYPES.has(firstWord) ? firstWord : "unknown"
}

/**
 * Parses a SQL query to extract table names and query type
 * Includes caching for better performance on repeated queries
 * @param sql The SQL query to parse
 * @returns ParsedSql object containing tables and query type
 */
export const parseSql = (sql: string): ParsedSql => {
  // Check cache first
  const cacheKey = sql.trim()
  const cached = queryCache.get(cacheKey)
  if (cached) return cached

  const tables = new Set<string>()
  const { cteNames, statementSql } = analyzeWithClause(cacheKey)
  const type = getQueryType(statementSql)
  const addTables = (tableNames: ReadonlyArray<string>) => {
    for (const table of tableNames) {
      if (!cteNames.has(table)) {
        tables.add(table)
      }
    }
  }

  // Extract tables based on query type
  switch (type) {
    case "select":
      addTables(extractTableNames(cacheKey, PATTERNS.FROM))
      addTables(extractTableNames(cacheKey, PATTERNS.JOIN))
      break

    case "update":
      addTables(extractTableNames(cacheKey, PATTERNS.UPDATE))
      addTables(extractTableNames(cacheKey, PATTERNS.FROM))
      addTables(extractTableNames(cacheKey, PATTERNS.JOIN))
      break

    case "insert":
      addTables(extractTableNames(cacheKey, PATTERNS.INSERT))
      break

    case "create":
      addTables(extractTableNames(cacheKey, PATTERNS.CREATE_TABLE))
      break
  }

  const result = {
    tables: Array.from(tables),
    type
  }

  // Update cache with LRU-like behavior
  if (queryCache.size >= CACHE_SIZE) {
    const firstKey = queryCache.keys().next().value
    if (firstKey) queryCache.delete(firstKey)
  }
  queryCache.set(cacheKey, result)

  return result
}
