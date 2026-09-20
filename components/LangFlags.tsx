'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function readLang(): 'ru' | 'en' {
  if (typeof document === 'undefined') return 'ru'
  const m = document.cookie.match(/(?:^|;\s*)lang=(ru|en)/)
  return m ? (m[1] as 'ru' | 'en') : 'ru'
}

const RuFlag = (
  <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
    <rect width="20" height="14" rx="2" fill="#ffffff" />
    <rect y="4.66" width="20" height="4.67" fill="#0039A6" />
    <rect y="9.33" width="20" height="4.67" fill="#D52B1E" />
  </svg>
)

const UsFlag = (
  <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
    <rect width="20" height="14" rx="2" fill="#B22234" />
    <rect y="2" width="20" height="2" fill="#ffffff" />
    <rect y="6" width="20" height="2" fill="#ffffff" />
    <rect y="10" width="20" height="2" fill="#ffffff" />
    <rect width="9" height="7" fill="#3C3B6E" />
  </svg>
)

export default function LangFlags() {
  const router = useRouter()
  const [lang, setLang] = useState<'ru' | 'en'>(() => readLang())
  const pick = (v: 'ru' | 'en') => {
    if (v === lang) return
    document.cookie = `lang=${v}; path=/; max-age=31536000; samesite=lax`
    setLang(v)
    router.refresh()
  }
  return (
    <div className="lang-flags">
      <button
        type="button"
        title="Русский"
        className={`lang-flag ${lang === 'ru' ? 'lang-flag-active' : ''}`}
        onClick={() => pick('ru')}
      >
        {RuFlag}
      </button>
      <button
        type="button"
        title="English"
        className={`lang-flag ${lang === 'en' ? 'lang-flag-active' : ''}`}
        onClick={() => pick('en')}
      >
        {UsFlag}
      </button>
    </div>
  )
}