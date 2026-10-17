import { createContext } from 'react'
import type { LanguageId } from '../types'
import type { TranslationKey } from './translations'

export interface I18nContextValue {
  lang: LanguageId
  setLang: (lang: LanguageId) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined)
