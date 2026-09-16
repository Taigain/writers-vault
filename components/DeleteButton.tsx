'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

export default function DeleteButton({
  onConfirm,
  label,
  confirmText,
  className,
  thenGo,
}: {
  onConfirm: () => Promise<void>
  label: string
  confirmText: string
  className?: string
  thenGo?: string
}) {
  const [busy, setBusy] = useState(false)
  return (
    <button
      type="button"
      disabled={busy}
      className={className ?? 'btn btn-danger btn-sm'}
      onClick={async () => {
        if (!window.confirm(confirmText)) return
        setBusy(true)
        await onConfirm()
        if (thenGo) {
          window.location.href = thenGo
          return
        }
        setBusy(false)
      }}
    >
      <Trash2 size={13} /> {label}
    </button>
  )
}