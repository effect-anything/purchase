import { Config } from "effect"

export const BASE_PUBLIC_URL = Config.string("BASE_PUBLIC_URL").pipe(Config.withDefault("http://localhost:3000"))
