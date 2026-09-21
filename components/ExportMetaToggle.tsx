'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { setBookExportMeta } from '@/lib/actions'
import { useLang } from '@/lib/useLang'

export default function ExportMetaToggle({ bookId, initial }: { bookId: string; initial: boolean }) {
  const { t } = useLang()
  const [on, setOn] = useState(initial)
  return (
    <label
      className="flex items-center gap-2 text-xs cursor-pointer select-none"
      style={{ color: 'var(--soft)' }}
    >
      <input
        type="checkbox"
        checked={on}
        onChange={async (e) => {
          const v = e.target.checked
          setOn(v)
          await setBookExportMeta(bookId, v)
        }}
      />
      <FileText size={13} />
      {t('bkExportMeta')}
    </label>
  )
}