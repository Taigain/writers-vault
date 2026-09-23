'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ImportDocxButton({
  label,
  onFile,
}: {
  label: string
  onFile: (fd: FormData) => Promise<{ ok: true; bookId?: string } | { ok: false; error: string }>
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  return (
    <label
      className="btn btn-ghost btn-sm cursor-pointer"
      style={busy ? { opacity: 0.6, pointerEvents: 'none' } : undefined}
    >
      <Upload size={14} /> {label}
      <input
        ref={inputRef}
        type="file"
        accept=".docx"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          const fd = new FormData()
          fd.set('file', f)
          setBusy(true)
          try {
            const res = await onFile(fd)
            if (res.ok) {
              if (res.bookId) router.push(`/book/${res.bookId}?tab=chapters`)
            } else {
              window.alert(res.error)
            }
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Ошибка импорта')
          } finally {
            setBusy(false)
            if (inputRef.current) inputRef.current.value = ''
          }
        }}
      />
    </label>
  )
}