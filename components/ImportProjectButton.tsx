'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'
import { useLang } from '@/lib/useLang'

export default function ImportProjectButton() {
  const { t } = useLang()
  const router = useRouter()
  const ref = useRef<HTMLInputElement | null>(null)
  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => ref.current?.click()}>
        <Upload size={14} /> {t('ppImport')}
      </button>
      <input
        ref={ref}
        type="file"
        accept=".wvproj"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          const fd = new FormData()
          fd.append('file', f)
          const res = await fetch('/api/project/import', { method: 'POST', body: fd })
          const json = await res.json().catch(() => null)
          if (res.ok && json?.bookId) router.refresh()
          else alert(json?.error ?? 'import error')
          e.target.value = ''
        }}
      />
    </>
  )
}