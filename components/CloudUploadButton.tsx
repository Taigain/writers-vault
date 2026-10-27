'use client'

import { useState } from 'react'
import { CloudUpload } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { cloudBackupBook, setBookCloudBackup } from '@/lib/actions'

export default function CloudUploadButton({
  bookId,
  cloudBackup,
}: {
  bookId: string
  cloudBackup: boolean
}) {
  const { t } = useLang()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  return (
    <span className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--soft)' }}>
        <input
          type="checkbox"
          defaultChecked={cloudBackup}
          onChange={(e) => void setBookCloudBackup(bookId, e.target.checked)}
        />
        {t('cldBookToggle')}
      </label>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setMsg('')
          const r = await cloudBackupBook(bookId)
          setBusy(false)
          setMsg(r.ok ? t('cldDone', { n: String(r.count ?? 0) }) : t('cldErr', { e: r.error ?? '' }))
        }}
      >
        <CloudUpload size={14} /> {busy ? t('cldUploading') : t('cldUpload')}
      </button>
      {msg && (
        <span className="text-xs" style={{ color: msg.startsWith('Выгружено') || msg.startsWith('Uploaded') ? 'var(--soft)' : 'var(--danger, #b3261e)' }}>
          {msg}
        </span>
      )}
    </span>
  )
}