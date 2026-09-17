"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useLang } from '@/lib/useLang'

type ChapterLite = { id: string; title: string; content: string; index: number }

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function Highlight({ text, query }: { text: string; query: string }) {
  const parts = text.split(new RegExp(`(${escapeReg(query)})`, 'gi'))
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase() ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>,
      )}
    </>
  )
}

export default function ChapterSearch({
  bookId,
  chapters,
}: {
  bookId: string
  chapters: ChapterLite[]
}) {
  const { t } = useLang()
  const router = useRouter()
  const [q, setQ] = useState('')
  const query = q.trim()

  const results = useMemo(() => {
    if (query.length < 2) return []
    const lower = query.toLowerCase()
    const out: { ch: ChapterLite; count: number; snippets: string[] }[] = []
    for (const ch of chapters) {
      const re = new RegExp(escapeReg(query), 'gi')
      let count = 0
      const snippets: string[] = []
      let m: RegExpExecArray | null
      while ((m = re.exec(ch.content)) !== null) {
        count++
        if (snippets.length < 3) {
          const start = Math.max(0, m.index - 60)
          const end = Math.min(ch.content.length, m.index + query.length + 60)
          snippets.push(
            (start > 0 ? '…' : '') +
              ch.content.slice(start, end).replace(/\s+/g, ' ') +
              (end < ch.content.length ? '…' : ''),
          )
        }
        if (count > 99) break
      }
      const titleHit = ch.title.toLowerCase().includes(lower)
      if (count > 0 || titleHit) out.push({ ch, count, snippets })
    }
    return out
  }, [query, chapters])

  const total = results.reduce((s, r) => s + r.count, 0)

  return (
    <div className="ch-search">
      <div className="ch-search-bar">
        <Search size={15} className="shrink-0" style={{ color: 'var(--soft)' }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('chSearchPh')}
          className="flex-1 bg-transparent outline-none text-sm"
        />
        {q !== '' && (
          <button type="button" className="mini-btn" onClick={() => setQ('')}>
            <X size={14} />
          </button>
        )}
        {query.length >= 2 && (
          <span className="chip">{t('chSearchFound', { n: total, c: results.length })}</span>
        )}
      </div>

      {query.length >= 2 && (
        <div className="ch-search-results">
          {results.length === 0 ? (
            <div className="text-xs p-3" style={{ color: 'var(--soft)' }}>{t('chSearchEmpty')}</div>
          ) : (
            results.map((r) => (
              <button
                key={r.ch.id}
                type="button"
                className="ch-search-item"
                onClick={() => router.push(`/book/${bookId}?tab=chapters&ch=${r.ch.id}`)}
              >
                <div className="flex items-center gap-2">
                  <span className="nav-ch-num">{r.ch.index + 1}</span>
                  <span className="font-semibold text-sm truncate">{r.ch.title}</span>
                  <span className="chip ml-auto">{r.count}</span>
                </div>
                {r.snippets.map((s, i) => (
                  <div key={i} className="ch-search-snippet">
                    <Highlight text={s} query={query} />
                  </div>
                ))}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}