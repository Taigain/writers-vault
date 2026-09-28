'use client'

import { useState } from 'react'
import { useLang } from '@/lib/useLang'
import { QUOTE_STYLES, getQuoteStyle, setQuoteStyle } from '@/lib/quotes'

export default function QuoteStyleSetting() {
  const { t } = useLang()
  const [cur, setCur] = useState(getQuoteStyle().key)
  return (
    <div>
      <div className="field-label mb-1">{t('stQuotes')}</div>
      <div className="flex flex-wrap gap-2">
        {QUOTE_STYLES.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`chip-btn ${cur === s.key ? 'chip-btn-active' : ''}`}
            onClick={() => {
              setQuoteStyle(s.key)
              setCur(s.key)
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}