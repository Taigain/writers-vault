'use client'

import { useState } from 'react'
import { BarChart3, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { parseScenes } from '@/lib/scenes'

export default function BookStats({
  chapters,
  characters,
  locations,
  lore,
  totalWords,
  totalChars,
}: {
  chapters: { id: string; title: string; content: string }[]
  characters: { id: string; name: string }[]
  locations: { id: string; name: string }[]
  lore: { id: string; text: string }[]
  totalWords: number
  totalChars: number
}) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const scenesCount = chapters.reduce((sum, ch) => sum + parseScenes(ch.content).length, 0)
  const authorSheets = totalChars / 40000
  const bookPages = Math.round(totalChars / 1800)

  const compact = [
    { label: t('bsChapters'), value: chapters.length },
    { label: t('bsWords'), value: totalWords.toLocaleString('ru-RU') },
    { label: t('bsAuthorSheets'), value: authorSheets.toFixed(1) },
  ]

  const detailed = [
    { label: t('bsChapters'), value: chapters.length, hint: '' },
    { label: t('bsScenes'), value: scenesCount, hint: '' },
    { label: t('bsWords'), value: totalWords.toLocaleString('ru-RU'), hint: '' },
    { label: t('bsChars'), value: totalChars.toLocaleString('ru-RU'), hint: '' },
    { label: t('bsAuthorSheets'), value: authorSheets.toFixed(2), hint: t('bsAuthorSheetsHint') },
    { label: t('bsBookPages'), value: bookPages.toLocaleString('ru-RU'), hint: t('bsBookPagesHint') },
    { label: t('bsCharacters'), value: characters.length, hint: '' },
    { label: t('bsLocations'), value: locations.length, hint: '' },
    { label: t('bsLore'), value: lore.length, hint: '' },
  ]

  return (
    <div className="card p-4 mb-6">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <BarChart3 size={18} style={{ color: 'var(--gold)' }} />
          <span className="text-sm font-bold">{t('bsTitle')}</span>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--soft)' }}>
          {compact.map((c, i) => (
            <span key={i} className="flex items-baseline gap-1">
              <span className="text-lg font-bold" style={{ color: 'var(--fg)' }}>
                {c.value}
              </span>
              <span>{c.label}</span>
            </span>
          ))}
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {detailed.map((d, i) => (
              <div key={i} className="card p-3 space-y-1" style={{ background: 'var(--soft-bg)' }}>
                <div className="text-xs font-semibold" style={{ color: 'var(--soft)' }}>
                  {d.label}
                </div>
                <div className="text-xl font-bold">{d.value}</div>
                {d.hint && (
                  <div className="text-[11px] flex items-start gap-1" style={{ color: 'var(--soft)' }}>
                    <Info size={11} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>{d.hint}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-xs" style={{ color: 'var(--soft)' }}>
            {t('bsFootnote')}
          </div>
        </div>
      )}
    </div>
  )
}