"use client"

import { useState } from 'react'
import { setBookSeries } from '@/lib/actions'
import { useLang } from '@/lib/useLang'

export default function SeriesPicker({
  bookId,
  series,
  seriesId,
}: {
  bookId: string
  series: { id: string; name: string }[]
  seriesId: string | null
}) {
  const { t } = useLang()
  const [busy, setBusy] = useState(false)

  return (
    <div>
      <label className="field-label">{t('bpSeries')}</label>
      <select
        className="input"
        defaultValue={seriesId ?? ''}
        disabled={busy}
        onChange={async (e) => {
          setBusy(true)
          await setBookSeries(bookId, e.target.value || null)
          setBusy(false)
        }}
      >
        <option value="">{t('bpSeriesNone')}</option>
        {series.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  )
}