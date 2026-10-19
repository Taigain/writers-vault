'use client'

import { FileDown } from 'lucide-react'
import { useLang } from '@/lib/useLang'

export default function ExportMdButton({ bookId }: { bookId: string }) {
  const { t } = useLang()
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={() => {
        let dash = 'em'
        try {
          if (localStorage.getItem('wv-dash') === 'en') dash = 'en'
        } catch {
          /* ignore */
        }
        window.location.href = `/api/export-md/${bookId}?dash=${dash}`
      }}
    >
      <FileDown size={14} /> {t('exMd')}
    </button>
  )
}