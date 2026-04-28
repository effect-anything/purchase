const root = document.documentElement
const APPEARANCE_KEY = "ui-appearance"
const APPEARANCE_STATE_KEY = "ui-appearance-state"
const UI_SIZE_PRESETS = {
  small: { fontSize: 14 },
  default: { fontSize: 15 },
  large: { fontSize: 16 }
}

const parseAppearanceState = () => {
  try {
    const raw = localStorage.getItem(APPEARANCE_STATE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

const getResolvedAppearance = (appearance) => {
  if (appearance === "light" || appearance === "dark") {
    return appearance
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  return mediaQuery.matches ? "dark" : "light"
}

const applyBodyState = (pointerCursors) => {
  const apply = () => {
    if (!document.body) return false

    document.body.classList.toggle("pointer-cursors", pointerCursors)
    return true
  }

  if (apply()) return

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      apply()
    },
    { once: true }
  )
}

const applyAppearanceState = () => {
  const appearanceState = parseAppearanceState()
  const appearance =
    appearanceState?.mode === "light" || appearanceState?.mode === "dark" || appearanceState?.mode === "system"
      ? appearanceState.mode
      : localStorage.getItem(APPEARANCE_KEY) || "system"
  const resolvedAppearance = getResolvedAppearance(appearance)

  root.classList.remove("light", "dark")
  root.classList.add(resolvedAppearance)
  root.dataset.theme = resolvedAppearance
  root.style.setProperty("color-scheme", resolvedAppearance)

  if (typeof appearanceState?.codeFontSize === "number") {
    root.style.setProperty("--font-size-code", `${Math.round(appearanceState.codeFontSize)}px`)
  }

  const uiSize =
    appearanceState?.uiSize === "small" || appearanceState?.uiSize === "default" || appearanceState?.uiSize === "large"
      ? appearanceState.uiSize
      : "default"
  root.style.setProperty("--font-size-ui", `${UI_SIZE_PRESETS[uiSize].fontSize}px`)

  const activeTheme = appearanceState?.themes?.[resolvedAppearance]
  if (activeTheme?.fonts?.ui) {
    root.style.setProperty("--font-ui", activeTheme.fonts.ui)
  }
  if (activeTheme?.fonts?.code) {
    root.style.setProperty("--font-code", activeTheme.fonts.code)
  }

  applyBodyState(appearanceState?.pointerCursors !== false)
}

applyAppearanceState()
