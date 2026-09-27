'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { downloadDataUrl } from '@/lib/imgutil'

export default function ZoomImage({ src, name }: { src: string; name?: string }) {
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
        onClick={() => setOpen(true)}
        title={t('imgZoomHint')}
        style={{ display: 'block', width: '100%', cursor: 'zoom-in', background: 'none', border: 'none', padding: 0 }}
      >
        <img
          src={src}
          alt=""
          style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: '.6rem', display: 'block' }}
        />
      </button>
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}
              title={t('imgDownload')}
              onClick={() => downloadDataUrl(src, name ?? 'image')}
            >
              <Download size={14} /> {t('imgDownload')}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}
              title={t('imgClose')}
              onClick={() => setOpen(false)}
            >
              <X size={14} />
            </button>
          </div>
          <img
            src={src}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '.4rem' }}
          />
        </div>
      )}
    </>
  )
}