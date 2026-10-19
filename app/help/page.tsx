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

  // Группировка для оглавления: порядок появления групп
  const groups: { name: string; firstIdx: number }[] = []
  items.forEach((it, i) => {
    if (!it.group) return
    if (groups.length === 0 || groups[groups.length - 1].name !== it.group) {
      groups.push({ name: it.group, firstIdx: i })
    }
  })

  return (
    <div className="help-wrap">
      <nav className="help-toc">
        <div className="help-toc-title">{t('helpToc')}</div>
        <ul>
          {groups.map((g, gi) => (
            <li key={g.name} className={gi > 0 ? 'help-toc-group-gap' : ''}>
              <div className="help-toc-group">{g.name}</div>
              <ul>
                {items
                  .map((it, i) => ({ it, i }))
                  .filter(({ it }) => it.group === g.name)
                  .map(({ it, i }) => (
                    <li key={i}>
                      <a
                        href={`#faq-${i}`}
                        className={i === active ? 'help-toc-active' : ''}
                        title={it.q}
                      >
                        {it.q}
                      </a>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
          {/* Статьи без группы (если появятся) — в конце оглавления */}
          {items.some((it) => !it.group) && (
            <li className="help-toc-group-gap">
              <ul>
                {items
                  .map((it, i) => ({ it, i }))
                  .filter(({ it }) => !it.group)
                  .map(({ it, i }) => (
                    <li key={i}>
                      <a
                        href={`#faq-${i}`}
                        className={i === active ? 'help-toc-active' : ''}
                        title={it.q}
                      >
                        {it.q}
                      </a>
                    </li>
                  ))}
              </ul>
            </li>
          )}
        </ul>
      </nav>
      <main className="help-content">
        <header className="help-head">
          <h1>{t('helpTitle')}</h1>
          <p>{t('helpSub')}</p>
        </header>
        {items.map((it, i) => {
          const prevGroup = i > 0 ? items[i - 1].group : null
          const showGroupHead = it.group && it.group !== prevGroup
          return (
            <div key={i}>
              {showGroupHead && (
                <h3 className="help-group-head" id={`group-${i}`}>
                  {it.group}
                </h3>
              )}
              <section
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
            </div>
          )
        })}
      </main>
    </div>
  )
}