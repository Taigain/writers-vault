'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/useLang'
import { getChapterIndex } from '@/lib/actions'

type Item = { id: string; title: string; content: string; index: number }
type Hit = { item: Item; pos: number; snippet: string }

export default function ChapterSearch({ bookId }: { bookId: string }) {
  const { t } = useLang()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Item[] | null>(null)
  const [loading, setLoading] = useState(false)

  const ensure = async () => {
    if (items || loading) return
    setLoading(true)
    try {
      setItems(await getChapterIndex(bookId))
    } finally {
      setLoading(false)
    }
  }

  const hits = useMemo<Hit[]>(() => {
    const query = q.trim().toLowerCase()
    if (!items || query.length < 2) return []
    const out: Hit[] = []
    for (const it of items) {
      const low = it.content.toLowerCase()
      let i = low.indexOf(query)
      while (i !== -1 && out.length < 100) {
        const start = Math.max(0, i - 40)
        out.push({ item: it, pos: i, snippet: it.content.slice(start, i + 80) })
        i = low.indexOf(query, i + query.length)
      }
      if (it.title.toLowerCase().includes(query) && out.length < 100) {
        out.push({ item: it, pos: 0, snippet: it.content.slice(0, 80) })
      }
    }
    return out
  }, [q, items])

  return (
    <div className="relative mb-4">
      <div className="flex items-center gap-2 input">
        <Search size={14} style={{ color: 'var(--soft)' }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => void ensure()}
          placeholder={t('csPh')}
          className="flex-1 bg-transparent outline-none border-none text-sm"
        />
        {loading && <span className="text-xs" style={{ color: 'var(--soft)' }}>…</span>}
      </div>
      {q.trim().length >= 2 && items && (
        <div className="card mt-1 max-h-72 overflow-y-auto" style={{ position: 'absolute', zIndex: 30, width: '100%' }}>
          {hits.length === 0 && (
            <div className="p-3 text-sm" style={{ color: 'var(--soft)' }}>
              {t('csEmpty')}
            </div>
          )}
          {hits.map((h, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left p-2 hover:bg-[var(--soft-bg)] border-b"
              style={{ borderColor: 'var(--line)' }}
              onClick={() => {
                setQ('')
                router.push(
                  `/book/${bookId}?tab=chapters&ch=${h.item.id}&q=${encodeURIComponent(q.trim())}&pos=${h.pos}`,
                )
              }}
            >
              <div className="text-xs font-bold">
                {h.item.index + 1}. {h.item.title}
              </div>
              <div className="text-xs" style={{ color: 'var(--soft)' }}>
                …{h.snippet}…
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}