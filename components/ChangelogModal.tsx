'use client'

import { X } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import type { ChangeEntry } from '@/lib/changelog'

export default function ChangelogModal({
  open,
  onClose,
  title,
  entries,
}: {
  open: boolean
  onClose: () => void
  title: string
  entries: ChangeEntry[]
}) {
  const { lang, t } = useLang()
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,.45)' }}
      onClick={onClose}
    >
      <div
        className="card w-full max-w-2xl flex flex-col"
        style={{ maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 p-4 border-b" style={{ borderColor: 'var(--line)' }}>
          <span className="font-bold">{title}</span>
          <button type="button" className="mini-btn" onClick={onClose}>
            <X size={15} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto space-y-5">
          {entries.map((e) => (
            <div key={e.version}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-bold" style={{ color: 'var(--gold)' }}>v{e.version}</span>
                <span className="text-xs" style={{ color: 'var(--soft)' }}>{e.date}</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {(lang === 'ru' ? e.ru : e.en).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-sm" style={{ color: 'var(--soft)' }}>{t('clEmpty')}</div>
          )}
        </div>
        <div className="p-4 border-t flex justify-end" style={{ borderColor: 'var(--line)' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            {t('wnClose')}
          </button>
        </div>
      </div>
    </div>
  )
}