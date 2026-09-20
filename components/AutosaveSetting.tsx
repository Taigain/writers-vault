'use client'

import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'
import { useLang } from '@/lib/useLang'

const OPTIONS = [0, 15, 30, 60, 300]

export default function AutosaveSetting() {
  const { t } = useLang()
  const [val, setVal] = useState('60')
  useEffect(() => {
    setVal(localStorage.getItem('wv-autosave') ?? '60')
  }, [])
  const label = (s: number) =>
    s === 0 ? t('setAutosaveOff') : s < 60 ? t('setAutosaveSec', { n: s }) : t('setAutosaveMin', { n: s / 60 })
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-2 text-sm">
        <Timer size={15} style={{ color: 'var(--soft)' }} />
        <span>{t('setAutosave')}</span>
      </div>
      <select
        className="input w-auto"
        value={val}
        onChange={(e) => {
          setVal(e.target.value)
          localStorage.setItem('wv-autosave', e.target.value)
        }}
      >
        {OPTIONS.map((s) => (
          <option key={s} value={s}>{label(s)}</option>
        ))}
      </select>
    </div>
  )
}