'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/useLang'
import { DASH_CHAR, getDashStyle, setDashStyle, type DashStyle } from '@/lib/dashes'

export default function DashSetting() {
  const { t } = useLang()
  const [cur, setCur] = useState<DashStyle>('en')
  useEffect(() => {
    setCur(getDashStyle())
  }, [])
  return (
    <div>
      <div className="field-label mb-1">{t('stDash')}</div>
      <div className="flex flex-wrap gap-2">
        {(['en', 'em'] as DashStyle[]).map((k) => (
          <button
            key={k}
            type="button"
            className={`chip-btn ${cur === k ? 'chip-btn-active' : ''}`}
            onClick={() => {
              setDashStyle(k)
              setCur(k)
            }}
          >
            <span className="text-base font-bold">{DASH_CHAR[k]}</span>
            {t(k === 'en' ? 'stDashEn' : 'stDashEm')}
          </button>
        ))}
      </div>
      <div className="text-xs mt-2" style={{ color: 'var(--soft)' }}>{t('stDashHint')}</div>
    </div>
  )
}