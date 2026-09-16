'use client'

import { useCallback, useEffect, useState } from 'react'
import { tr, type Lang, type StrKey } from './i18n'

export function readLang(): Lang {
  if (typeof document === 'undefined') return 'ru'
  const m = document.cookie.match(/(?:^|; )wv-lang=(en|ru)/)
  const ls = localStorage.getItem('wv-lang')
  return (m?.[1] ?? ls) === 'en' ? 'en' : 'ru'
}

export function setLangEverywhere(lang: Lang) {
  localStorage.setItem('wv-lang', lang)
  document.cookie = `wv-lang=${lang}; path=/; max-age=31536000; samesite=lax`
  document.documentElement.lang = lang
}

export function useLang() {
  const [lang, setLang] = useState<Lang>('ru')
  useEffect(() => {
    setLang(readLang())
  }, [])
  const t = useCallback(
    (key: StrKey, vars?: Record<string, string | number>) => tr(lang, key, vars),
    [lang],
  )
  return { lang, t }
}