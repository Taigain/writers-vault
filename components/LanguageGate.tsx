'use client'

import { useEffect, useState } from 'react'

const KEY = 'wv-lang'

function currentLang(): 'ru' | 'en' | null {
  try {
    const ls = localStorage.getItem(KEY)
    if (ls === 'ru' || ls === 'en') return ls
    const m = document.cookie.match(/(?:^|; )wv-lang=(ru|en)/)
    if (m) return m[1] as 'ru' | 'en'
  } catch {
    /* ignore */
  }
  return null
}

export default function LanguageGate() {
  const [need, setNeed] = useState(false)

  useEffect(() => {
    setNeed(currentLang() === null)
  }, [])

  const pick = (l: 'ru' | 'en') => {
    try {
      localStorage.setItem(KEY, l)
      document.cookie = `${KEY}=${l}; path=/; max-age=157680000; SameSite=Lax`
    } catch {
      /* ignore */
    }
    window.location.reload()
  }

  if (!need) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 400,
        background: '#f6f3ec',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          maxWidth: 620,
          width: '100%',
        }}
      >
        <span
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: '#211d19',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 22px rgba(32,28,23,.28)',
          }}
        >
          <img src="/favicon.ico" alt="" width={44} height={44} />
        </span>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 26, color: 'var(--fg)' }}>
            Выберите язык интерфейса
          </div>
          <div
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 18,
              color: 'var(--soft)',
              marginTop: 6,
            }}
          >
            Choose your interface language
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button type="button" className="lang-tile" onClick={() => pick('ru')}>
            <span className="lt-name">Русский</span>
            <span className="lt-code">RU</span>
          </button>
          <button type="button" className="lang-tile" onClick={() => pick('en')}>
            <span className="lt-name">English</span>
            <span className="lt-code">EN</span>
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--soft)' }}>
          Выбор можно изменить в любой момент в настройках · You can change this later in settings
        </div>
      </div>
    </div>
  )
}