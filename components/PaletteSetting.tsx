'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/useLang'
import { PALETTES, getPalette, setPalette } from '@/lib/palettes'

export default function PaletteSetting() {
  const { lang, t } = useLang()
  const [cur, setCur] = useState('warm')
  useEffect(() => {
    setCur(getPalette().key)
  }, [])
  return (
    <div>
      <div className="field-label mb-1">{t('stPalette')}</div>
      <div className="flex flex-wrap gap-2">
        {PALETTES.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`chip-btn ${cur === p.key ? 'chip-btn-active' : ''}`}
            onClick={() => {
              setPalette(p.key)
              setCur(p.key)
            }}
          >
            <span className="flex items-center gap-1">
              {p.colors.slice(0, 5).map((c, i) => (
                <i key={i} className="graph-dot" style={{ background: c, width: 8, height: 8 }} />
              ))}
            </span>
            {lang === 'ru' ? p.ru : p.en}
          </button>
        ))}
      </div>
    </div>
  )
}