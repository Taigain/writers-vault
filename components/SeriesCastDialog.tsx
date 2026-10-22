'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { bringSoulIntoBook, type SeriesCharRow } from '@/lib/actions'

export default function SeriesCastDialog({
  bookId,
  souls,
  onClose,
  onDone,
}: {
  bookId: string
  souls: SeriesCharRow[]
  onClose: () => void
  onDone: () => void
}) {
  const { t } = useLang()
  const [busy, setBusy] = useState<string | null>(null)
  const available = souls.filter((s) => !s.doubles.some((d) => d.bookId === bookId))
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ background: 'rgba(20, 17, 14, 0.5)', zIndex: 340 }}
      onClick={onClose}
    >
      <div className="card p-5 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="font-bold">{t('scCastTitle')}</div>
        {available.length === 0 && (
          <div className="text-sm" style={{ color: 'var(--soft)' }}>{t('scCastEmpty')}</div>
        )}
        {available.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-2 text-sm">
            <Users size={14} style={{ color: 'var(--soft)' }} />
            <span className="font-semibold flex-1">{s.name}</span>
            <span className="text-xs" style={{ color: 'var(--soft)' }}>
              {s.doubles.map((d) => d.bookTitle).join(', ')}
            </span>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={busy === s.id}
              onClick={async () => {
                setBusy(s.id)
                await bringSoulIntoBook(bookId, s.id)
                setBusy(null)
                onDone()
              }}
            >
              {t('scBring')}
            </button>
          </div>
        ))}
        <div className="flex justify-end">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            {t('cmCancel')}
          </button>
        </div>
      </div>
    </div>
  )
}