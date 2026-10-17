import { useCallback, useEffect, useMemo, useState } from 'react'
import { I18nContext } from './i18n-context'
import { translate, type TranslationKey } from './translations'
import type { LanguageId } from '../types'

const LANG_KEY = 'skledger_lang'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageId>(() => {
    const stored = localStorage.getItem(LANG_KEY) as LanguageId | null
    return stored === 'bn' ? 'bn' : 'en'
  })

  const setLang = useCallback((next: LanguageId) => {
    setLangState(next)
    localStorage.setItem(LANG_KEY, next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => translate(key, lang, vars),
    [lang]
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
