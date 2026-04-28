import { afterEach, beforeEach, describe, expect, it, vi } from "@effect/vitest"
import { Effect } from "effect"
import { getI18n } from "react-i18next"

import { I18nLive } from "../src/browser.ts"
import { initI18n, LanguageDetector } from "../src/client.ts"
import { changeLanguage, language, locale, t } from "../src/i18n.ts"

type TranslationResources = Record<string, Record<string, Record<string, string | Record<string, string>>>>

const translations: TranslationResources = {
  en: {
    translation: {
      greeting: "Hello",
      nested: {
        title: "Welcome"
      }
    }
  },
  "zh-Hans": {
    translation: {
      greeting: "你好",
      nested: {
        title: "欢迎"
      }
    }
  }
}

const resetDocumentState = () => {
  window.history.replaceState({}, "", "/")
  document.cookie = "x-lng=; Max-Age=0; Path=/; SameSite=Strict"
  document.documentElement.lang = ""
}

const load = vi.fn(async (lng: string, ns: string) => {
  const entry = translations[lng]?.[ns]
  if (!entry) {
    throw new Error(`Missing translation payload for ${lng}/${ns}`)
  }
  return entry as Record<string, string>
})

beforeEach(() => {
  load.mockClear()
  resetDocumentState()
})

afterEach(async () => {
  const i18n = getI18n()
  if (i18n) {
    await i18n.changeLanguage("en")
  }
  vi.restoreAllMocks()
  resetDocumentState()
})

describe("browser language detection", () => {
  it("prefers search params, then cookies, then the html lang attribute", () => {
    window.history.replaceState({}, "", "/?lng=zh-CN")
    document.cookie = "x-lng=ja; Path=/"
    document.documentElement.lang = "en"

    const detector = new LanguageDetector({
      supportedLanguages: ["en", "zh-Hans", "ja"],
      fallbackLanguage: "en",
      order: ["searchParams", "cookie", "html-tag"]
    })

    expect(detector.detect()).toBe("zh-Hans")

    window.history.replaceState({}, "", "/?lng=fr")

    expect(detector.detect()).toBe("ja")

    document.cookie = "x-lng=fr; Max-Age=0; Path=/"

    expect(detector.detect()).toBe("en")
  })

  it("supports custom query keys before falling back to a named cookie", () => {
    window.history.replaceState({}, "", "/?language=ja")
    document.cookie = "preferred-lng=zh-CN; Path=/"

    const detector = new LanguageDetector({
      supportedLanguages: ["en", "zh-Hans", "ja"],
      fallbackLanguage: "en",
      searchParamKey: "language",
      cookie: {
        name: "preferred-lng"
      },
      order: ["searchParams", "cookie", "html-tag"]
    })

    expect(detector.detect()).toBe("ja")

    window.history.replaceState({}, "", "/?language=fr")

    expect(detector.detect()).toBe("zh-Hans")
  })
})

describe("browser i18n integration", () => {
  it.effect("initializes i18n resources and exposes them through the Effect layer", () =>
    Effect.gen(function* () {
      document.documentElement.lang = "zh-CN"

      yield* Effect.promise(() =>
        initI18n({
          initOptions: {
            defaultNS: "translation",
            fallbackLng: "en",
            ns: ["translation"],
            supportedLngs: ["en", "zh-Hans"]
          },
          load,
          order: ["html-tag"]
        })
      )

      const i18n = getI18n()
      expect(i18n).toBeTruthy()
      expect(i18n?.language).toBe("zh-Hans")
      expect(i18n?.t("greeting")).toBe("你好")
      expect(load).toHaveBeenCalledWith("zh-Hans", "translation")

      expect(yield* language).toBe("zh-Hans")
      expect(yield* locale).toBe("zh-Hans")
      expect(yield* t("greeting")).toBe("你好")
      expect(yield* t("title", { keyPrefix: "nested" })).toBe("欢迎")

      yield* changeLanguage("en")

      expect(getI18n()?.language).toBe("en")
      expect(document.documentElement.lang).toBe("en")
      expect(document.cookie).toContain("x-lng=en")
      expect(yield* t(["greeting"])).toEqual(["Hello"])
    }).pipe(Effect.provide(I18nLive))
  )
})
