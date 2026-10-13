'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { CHANGELOG } from '@/lib/changelog'
import { useLang } from '@/lib/useLang'

const KEY = 'wv-seen-version'

function readSeen(): string | null {
  try {
    const ls = localStorage.getItem(KEY)
    if (ls) return ls
    const m = document.cookie.match(/(?:^|; )wv-seen-version=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : null
  } catch {
    return null
  }
}

function writeSeen(v: string) {
  try {
    localStorage.setItem(KEY, v)
    document.cookie = `${KEY}=${encodeURIComponent(v)}; path=/; max-age=315360000; SameSite=Lax`
  } catch {
    /* ignore */
  }
}

export default function WhatsNewModal({ current }: { current: string }) {
  const { t, lang } = useLang()
  const [open, setOpen] = useState(false)
  const withNotes = CHANGELOG.filter((c) => (lang === 'ru' ? c.ru : c.en).length > 0)
  const entry = withNotes.find((c) => c.version === current) ?? withNotes[0] ?? null
  useEffect(() => {
    if (!entry) return
    if (readSeen() !== current) setOpen(true)
  }, [current, entry])
  if (!open || !entry) return null
  const notes = lang === 'ru' ? entry.ru : entry.en
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ background: 'rgba(20, 17, 14, 0.45)', zIndex: 380 }}
    >
      <div className="card p-6 w-full max-w-lg space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} style={{ color: 'var(--gold)' }} />
          <span className="font-bold text-lg">{t('wnTitle', { v: entry.version })}</span>
        </div>
        <ul className="space-y-2 text-sm list-disc pl-5">
          {notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              writeSeen(current)
              setOpen(false)
            }}
          >
            {t('wnOk')}
          </button>
        </div>
      </div>
    </div>
  )
}