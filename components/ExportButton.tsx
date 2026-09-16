'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { getSavedDir } from '@/lib/fsAccess'
import { useLang } from '@/lib/useLang'

export default function ExportButton({
  bookId,
  baseName,
  primary,
}: {
  bookId: string
  baseName: string
  primary?: boolean
}) {
  const { t } = useLang()
  const [status, setStatus] = useState<string | null>(null)

  const flash = (msg: string) => {
    setStatus(msg)
    setTimeout(() => setStatus(null), 4000)
  }

  const onClick = async () => {
    try {
      setStatus(t('exPreparing'))
      const res = await fetch(`/api/export/${bookId}`)
      if (!res.ok) throw new Error('server error')
      const blob = await res.blob()
      const fileName = baseName.replace(/[\\/:*?"<>|]/g, '_') + '.docx'

      const dir = await getSavedDir()
      if (dir) {
        const anyDir = dir as unknown as {
          queryPermission?: (d: { mode: string }) => Promise<string>
          requestPermission?: (d: { mode: string }) => Promise<string>
        }
        let perm = await anyDir.queryPermission?.({ mode: 'readwrite' })
        if (perm !== 'granted') {
          perm = await anyDir.requestPermission?.({ mode: 'readwrite' })
        }
        if (perm !== 'granted') throw new Error('no folder access')
        const fh = await dir.getFileHandle(fileName, { create: true })
        const writable = await fh.createWritable()
        await writable.write(blob)
        await writable.close()
        flash(t('exSaved', { name: dir.name }))
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
        flash(t('exDownloaded'))
      }
    } catch (e) {
      flash(t('exError', { msg: (e as Error).message }))
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        className={`btn btn-sm ${primary ? 'btn-primary' : 'btn-ghost'}`}
      >
        <Download size={14} /> {primary ? t('exBtnPrimary') : t('exBtn')}
      </button>
      {status && (
        <span className="text-xs" style={{ color: 'var(--soft)' }}>{status}</span>
      )}
    </span>
  )
}