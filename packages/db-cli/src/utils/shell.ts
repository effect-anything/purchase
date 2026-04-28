import * as NodeServices from "@effect/platform-node/NodeServices"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import * as ChildProcess from "effect/unstable/process/ChildProcess"
import * as CliLog from "./log.ts"

export type CommandOutput = {
  readonly stdout: string
  readonly stderr: string
}

export class ShellExecuteError extends Data.TaggedError("ShellExecuteError")<{
  command: string
  args: ReadonlyArray<string>
  cwd: string | undefined
  exitCode: number
  stdout: Array<string>
  stderr: Array<string>
  cause?: unknown
}> {
  override get message() {
    const command = [this.command, ...this.args].join(" ")
    const output = [...this.stderr, ...this.stdout].join("; ")

    return output.length > 0 ? `${command} failed: ${output}` : `${command} failed`
  }
}

export class ProcessExecuteError extends Data.TaggedError("ProcessExecuteError")<{
  command: string
  args: Array<string>
  exitCode: number
  cause?: Error | undefined
}> {
  override get message() {
    return `${[this.command, ...this.args].join(" ")} failed with exit code ${this.exitCode}`
  }
}

const ansiPattern = new RegExp(
  String.raw`[\u001b\u009b][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[a-zA-Z\d]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))`,
  "g"
)

export const formatCommandOutput = (output: string) =>
  output
    .replace(ansiPattern, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

const ignoredCommandOutputPatterns = [
  /^Loaded Prisma config from /,
  /^Prisma schema loaded from /,
  /^Environment variables loaded from /,
  /^Datasource ".*": /,
  /^SQLite database .* created at /,
  /^Generated prisma-markdown /,
  /^Generated Prisma Client /,
  /^✔ Generated prisma-markdown /,
  /^✔ Generated Prisma Client /,
  /^⛅️ wrangler /,
  /^wrangler \d+\.\d+\.\d+ /,
  /^[-─]{5,}$/,
  /^Resource location: /,
  /^Use --remote /,
  /^migrations\/$/,
  /^└─ /,
  /^ok$/i
] as const

const commandOutputLabels: Record<string, string> = {
  "prisma.generate": "Prisma generate",
  "prisma.migrate-diff": "Prisma migrate diff",
  "prisma.migrate-reset": "Prisma migrate reset",
  "prisma.migrate-deploy": "Prisma migrate deploy",
  "prisma.db-push": "Prisma db push",
  "prisma.db-execute": "Prisma db execute",
  "prisma.migrate-resolve": "Prisma migrate resolve",
  "db.seed": "Seed",
  "sqlite.execute": "SQLite execute",
  "wrangler.d1-migrations-apply": "D1 migrations"
}

const formatOperationLabel = (operation: string) =>
  commandOutputLabels[operation] ??
  operation
    .split(/[.-]/g)
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ")

const formatCommandMessage = (line: string) => {
  if (line === "The database is already in sync with the Prisma schema.") {
    return "database already in sync with schema"
  }

  if (line === "Your database is now in sync with your Prisma schema.") {
    return "database is now in sync with schema"
  }

  if (/^✅ No migrations to apply!?$/.test(line)) {
    return "no migrations to apply"
  }

  if (/^✅ .* applied successfully!?$/.test(line)) {
    return line.replace(/^✅\s*/, "").replace(/!$/, "")
  }

  return line.replace(/\.$/, "")
}

export const formatMeaningfulCommandOutput = (lines: ReadonlyArray<string>) => {
  const seen = new Set<string>()
  const output: Array<string> = []

  for (const line of lines) {
    if (ignoredCommandOutputPatterns.some((pattern) => pattern.test(line))) {
      continue
    }

    if (seen.has(line)) {
      continue
    }

    seen.add(line)
    output.push(line)
  }

  return output
}

export const logCommandOutput = Effect.fnUntraced(function* (
  operation: string,
  output: {
    readonly stdout?: string | undefined
    readonly stderr?: string | undefined
  }
) {
  const rawStdout = output.stdout ? formatCommandOutput(output.stdout) : []
  const rawStderr = output.stderr ? formatCommandOutput(output.stderr) : []
  const stdout = formatMeaningfulCommandOutput(rawStdout)
  const stderr = formatMeaningfulCommandOutput(rawStderr)

  if (stdout.length === 0 && stderr.length === 0) {
    return
  }

  const label = formatOperationLabel(operation)

  yield* Effect.forEach(stdout, (line) => CliLog.info(`${label}: ${formatCommandMessage(line)}`), { discard: true })

  yield* Effect.forEach(stderr, (line) => CliLog.warn(`${label}: ${formatCommandMessage(line)}`), {
    discard: true
  })
})

export const runCommand = Effect.fnUntraced(function* (
  command: string,
  args: ReadonlyArray<string> = [],
  options: {
    cwd?: string | undefined
    env?: Record<string, string | undefined> | undefined
    silent?: boolean | undefined
  } = {}
) {
  return yield* Effect.gen(function* () {
    const child = ChildProcess.make(command, args, {
      cwd: options.cwd,
      env: options.env,
      extendEnv: true
    })
    const handle = yield* child
    const [stdout, stderr, exitCode] = yield* Effect.all(
      [
        Stream.mkString(Stream.decodeText(handle.stdout)),
        Stream.mkString(Stream.decodeText(handle.stderr)),
        handle.exitCode
      ],
      { concurrency: "unbounded" }
    )
    const code = Number(exitCode)

    const output = {
      stdout,
      stderr
    }

    if (code === 0) {
      return output
    }

    return yield* Effect.die(
      new ShellExecuteError({
        command,
        args,
        cwd: options.cwd,
        exitCode: code,
        stdout: options.silent ? [] : formatMeaningfulCommandOutput(formatCommandOutput(stdout)),
        stderr: options.silent ? [] : formatMeaningfulCommandOutput(formatCommandOutput(stderr))
      })
    )
  }).pipe(Effect.scoped, Effect.provide(NodeServices.layer), Effect.orDie)
})

export const runCommandLine = Effect.fnUntraced(function* (
  commandLine: ReadonlyArray<string>,
  options: {
    cwd?: string | undefined
    env?: Record<string, string | undefined> | undefined
    silent?: boolean | undefined
  } = {}
) {
  const [command, ...args] = commandLine

  if (!command) {
    return yield* Effect.die("Command line is empty")
  }

  return yield* runCommand(command, args, options)
})
