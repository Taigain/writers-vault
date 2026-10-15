'use client'

import { useEffect, useRef, useState } from 'react'
import { useLang } from '@/lib/useLang'
import { FAQ } from '@/lib/faq'

export default function HelpPage() {
  const { t, lang } = useLang()
  const items = FAQ[lang]
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            const idx = Number((en.target as HTMLElement).dataset.idx)
            if (!Number.isNaN(idx)) setActive(idx)
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    for (const el of refs.current) if (el) obs.observe(el)
    return () => obs.disconnect()
  }, [lang, items.length])

  return (
    <div className="help-wrap">
      <nav className="help-toc">
        <div className="help-toc-title">{t('helpToc')}</div>
        <ul>
          {items.map((it, i) => (
            <li key={i}>
              <a href={`#faq-${i}`} className={i === active ? 'help-toc-active' : ''} title={it.q}>
                {it.q}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <main className="help-content">
        <header className="help-head">
          <h1>{t('helpTitle')}</h1>
          <p>{t('helpSub')}</p>
        </header>
        {items.map((it, i) => (
          <section
            key={i}
            id={`faq-${i}`}
            data-idx={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            className="help-section"
          >
            <h2>{it.q}</h2>
            <p>{it.a}</p>
          </section>
        ))}
      </main>
    </div>
  )
}