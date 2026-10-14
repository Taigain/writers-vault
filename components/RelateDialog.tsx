'use client'

import { useState } from 'react'
import { X, Link2 } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import type { StrKey } from '@/lib/i18n'

const PRESETS: { key: StrKey; color: string }[] = [
  { key: 'rlFriend', color: '#3a7a4a' },
  { key: 'rlEnemy', color: '#8c3a2b' },
  { key: 'rlFamily', color: '#b98a3e' },
  { key: 'rlLove', color: '#a64563' },
  { key: 'rlMentor', color: '#2b5a8c' },
  { key: 'rlStudent', color: '#2b5a8c' },
  { key: 'rlRival', color: '#8c3a2b' },
  { key: 'rlAlly', color: '#3a7a4a' },
]

export default function RelateDialog({
  aName,
  bName,
  onClose,
  onSave,
}: {
  aName: string
  bName: string
  onClose: () => void
  onSave: (kind: 'mutual' | 'oneway', note: string) => Promise<void>
}) {
  const { t } = useLang()
  const [kind, setKind] = useState<'mutual' | 'oneway'>('mutual')
  const [note, setNote] = useState('')
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ background: 'rgba(20, 17, 14, 0.5)', zIndex: 340 }}
      onClick={onClose}
    >
      <div className="card p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">{t('rlTitle')}</span>
          <button type="button" className="mini-btn" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <div className="text-sm" style={{ color: 'var(--soft)' }}>{t('rlSub', { a: aName, b: bName })}</div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--soft-bg)' }}>
          <button
            type="button"
            className={`btn btn-sm flex-1 ${kind === 'mutual' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setKind('mutual')}
          >
            {t('rlMutual')}
          </button>
          <button
            type="button"
            className={`btn btn-sm flex-1 ${kind === 'oneway' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setKind('oneway')}
          >
            {t('rlOneway')}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ borderColor: p.color, color: p.color }}
              onClick={() => setNote(t(p.key))}
            >
              {t(p.key)}
            </button>
          ))}
        </div>
        <input
          className="input"
          placeholder={t('rlCustom')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            {t('rlCancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={!note.trim()}
            onClick={() => void onSave(kind, note.trim())}
          >
            <Link2 size={13} /> {t('rlSave')}
          </button>
        </div>
      </div>
    </div>
  )
}