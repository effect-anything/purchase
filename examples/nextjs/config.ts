import { Config } from "effect"

export const BASE_PUBLIC_URL = Config.string("BASE_PUBLIC_URL").pipe(Config.withDefault("http://localhost:3000"))

export const PADDLE_CHECKOUT_URL = Config.string("PADDLE_CHECKOUT_URL").pipe(Config.option)

export const PADDLE_CLIENT_TOKEN = Config.string("PADDLE_CLIENT_TOKEN").pipe(Config.option)
