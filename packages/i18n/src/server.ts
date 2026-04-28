// @ts-ignore
import { pick } from "accept-language-parser"
import { type BackendModule, createInstance, type i18n as I18nInstance, type InitOptions } from "i18next"
import { parseAcceptLanguage } from "intl-parse-accept-language"
import { setDefaults } from "react-i18next"

import { findCookieByName } from "./utils.ts"

export type Locales = string | string[] | undefined

export interface Cookie {
  readonly name: string
  readonly isSigned: boolean
  readonly expires?: Date
  parse(cookieHeader: string | null): any
  serialize(value: any): string
}

export type ServerI18nInitializer = (request: Request) => Promise<I18nInstance>

declare global {
  var initI18n: ServerI18nInitializer | undefined
}

export function getClientLocales(headers: Headers): Locales
export function getClientLocales(request: Request): Locales
export function getClientLocales(requestOrHeaders: Request | Headers): Locales {
  const headers = getHeaders(requestOrHeaders)

  const xlang = headers.get("x-lng")
  const acceptLanguage = headers.get("Accept-Language")

  if (!xlang && !acceptLanguage) return undefined

  const locales = parseAcceptLanguage(xlang || acceptLanguage, {
    validate: Intl.DateTimeFormat.supportedLocalesOf,
    ignoreWildcard: true
  })

  if (locales.length === 0) return undefined
  if (locales.length === 1) return locales[0]
  return locales
}

export function getHeaders(requestOrHeaders: Request | Headers): Headers {
  if (requestOrHeaders instanceof Request) {
    return requestOrHeaders.headers
  }

  return requestOrHeaders
}

export interface LanguageDetectorOption {
  supportedLanguages: Array<string>
  fallbackLanguage: string
  cookie?: Cookie
  searchParamKey?: string
  order?: Array<"searchParams" | "cookie" | "session" | "header"> | undefined
}

export class LanguageDetector {
  private options: LanguageDetectorOption

  constructor(options: LanguageDetectorOption) {
    this.options = options
    this.isCookieOnly(options)
  }

  private isCookieOnly(options: LanguageDetectorOption) {
    if (options.order?.length === 1 && options.order[0] === "cookie" && !options.cookie) {
      throw new Error("You need a cookie if you want to only get the locale from the cookie")
    }
  }

  public detect(request: Request): string {
    const order = this.options.order ?? ["searchParams", "cookie", "session", "header"]

    for (const method of order) {
      let locale: string | null = null

      if (method === "searchParams") {
        locale = this.fromSearchParams(request)
      }

      if (method === "cookie") {
        locale = this.fromCookie(request)
      }

      if (method === "header") {
        locale = this.fromHeader(request)
      }

      if (locale) return locale
    }

    return this.options.fallbackLanguage
  }

  private fromSearchParams(request: Request): string | null {
    const url = new URL(request.url)

    if (!url.searchParams.has(this.options.searchParamKey ?? "lng")) {
      return null
    }

    return this.fromSupported(url.searchParams.get(this.options.searchParamKey ?? "lng"))
  }

  private fromCookie(request: Request): string | null {
    if (!this.options.cookie) return null

    const lng = this.options.cookie.parse(request.headers.get("Cookie")) ?? ""
    if (!lng) return null

    return this.fromSupported(lng)
  }

  private fromHeader(request: Request): string | null {
    const locales = getClientLocales(request)
    if (!locales) return null
    if (Array.isArray(locales)) return this.fromSupported(locales.join(","))
    return this.fromSupported(locales)
  }

  private fromSupported(language: string | null) {
    return (
      pick(this.options.supportedLanguages, language ?? this.options.fallbackLanguage, { loose: false }) ||
      pick(this.options.supportedLanguages, language ?? this.options.fallbackLanguage, { loose: true })
    )
  }
}

const resourcesToBackend = (load: (lng: string, ns: string) => Promise<Record<string, string>>) =>
  ({
    type: "backend",
    init() {},
    read(language: string, namespace: string, callback: any) {
      load(language, namespace)
        .then((data: any) => callback(null, data?.default || data))
        .catch((error) => callback(error))
    }
  }) satisfies BackendModule

const createCachedResourceLoader = (load: (lng: string, ns: string) => Promise<Record<string, string>>) => {
  const cache = new Map<string, Promise<Record<string, string>>>()

  return (lng: string, ns: string) => {
    const key = `${lng}:${ns}`
    const existing = cache.get(key)
    if (existing) {
      return existing
    }

    const next = load(lng, ns).catch((error) => {
      cache.delete(key)
      throw error
    })

    cache.set(key, next)
    return next
  }
}

const resolveFallbackLanguage = (fallbackLng: InitOptions["fallbackLng"], fallback: string): string => {
  if (typeof fallbackLng === "string") {
    return fallbackLng
  }

  if (Array.isArray(fallbackLng)) {
    return fallbackLng[0] ?? fallback
  }

  if (typeof fallbackLng === "function") {
    return fallback
  }

  if (fallbackLng && typeof fallbackLng === "object") {
    const defaultFallback = "default" in fallbackLng ? fallbackLng.default : undefined

    if (typeof defaultFallback === "string") {
      return defaultFallback
    }

    if (Array.isArray(defaultFallback)) {
      return defaultFallback[0] ?? fallback
    }
  }

  return fallback
}

export const initI18n = (
  initOptions: InitOptions & {
    loadResource: (lng: string, ns: string) => Promise<Record<string, string>>
  }
): ServerI18nInitializer => {
  const loadResource = createCachedResourceLoader(initOptions.loadResource)

  setDefaults(initOptions.react ?? {})

  return async (request: Request) => {
    const lng = detectLanguage(request, initOptions)
    const instance = createInstance()

    await instance.use(resourcesToBackend(loadResource)).init({
      partialBundledLanguages: true,
      ...initOptions,
      initAsync: true,
      load: "currentOnly",
      lng
    })

    return instance
  }
}

export const detectLanguage = (
  request: Request,
  initOptions: InitOptions,
  order?: Array<"searchParams" | "cookie" | "session" | "header">,
  fallback = "en"
): string => {
  const cookieKey = "x-lng"
  const fallbackLanguage = resolveFallbackLanguage(initOptions.fallbackLng, fallback)

  const detector = new LanguageDetector({
    supportedLanguages: (initOptions.supportedLngs || []) as Array<string>,
    fallbackLanguage,
    order,
    cookie: {
      name: cookieKey,
      isSigned: false,
      parse: (cookieHeader: string | null) => {
        if (!cookieHeader) {
          return
        }

        return findCookieByName(cookieKey, cookieHeader)
      },
      serialize: (value: any) => value
    }
  })

  return detector.detect(request)
}
