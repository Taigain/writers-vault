'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useLang } from '@/lib/useLang'

export default function ZoomImage({
  src,
  alt = '',
  className,
}: {
  src: string
  alt?: string
  className?: string
}) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        className={`zoom-thumb ${className ?? ''}`}
        title={t('imgZoomHint')}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <img src={src} alt={alt} />
      </button>
      {open && (
        <div className="zoom-overlay" onClick={() => setOpen(false)}>
          <button
            type="button"
            className="zoom-close"
            title={t('imgZoomClose')}
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
          >
            <X size={18} />
          </button>
          <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}