'use client'

import { useLang } from '@/lib/useLang'
import { setBookExportFlag } from '@/lib/actions'

export type ExportFlags = {
  title: boolean
  annotation: boolean
  synopsis: boolean
  author: boolean
}

export default function ExportMetaToggle({
  bookId,
  initial,
}: {
  bookId: string
  initial: ExportFlags
}) {
  const { t } = useLang()
  const items: {
    key: keyof ExportFlags
    field: 'exportTitle' | 'exportAnnotation' | 'exportSynopsis' | 'exportAuthor'
    label: string
  }[] = [
    { key: 'title', field: 'exportTitle', label: t('emTitle') },
    { key: 'annotation', field: 'exportAnnotation', label: t('emAnnotation') },
    { key: 'synopsis', field: 'exportSynopsis', label: t('emSynopsis') },
    { key: 'author', field: 'exportAuthor', label: t('emAuthor') },
  ]
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--soft)' }}>
      <span>{t('emInclude')}</span>
      {items.map((it) => (
        <label key={it.key} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            defaultChecked={initial[it.key]}
            onChange={(e) => setBookExportFlag(bookId, it.field, e.target.checked)}
          />
          {it.label}
        </label>
      ))}
    </div>
  )
}