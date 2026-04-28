import type { i18n } from "i18next"
import type { ReactNode } from "react"

import { I18nextProvider } from "react-i18next"

export const I18nServerWrapper = ({ children, i18n }: { children: ReactNode; i18n: i18n }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
