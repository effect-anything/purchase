import * as Console from "effect/Console"

export const info = (message: string) => Console.log(message)

export const warn = (message: string) => Console.warn(`Warning: ${message}`)

export const error = (message: string) => Console.error(`Error: ${message}`)
