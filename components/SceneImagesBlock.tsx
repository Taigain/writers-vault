'use client'

import { useEffect, useRef, useState } from 'react'
import { Image as ImageIcon, Trash2, Download } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import {
  createSceneImage,
  updateSceneImage,
  deleteSceneImage,
  getSceneImagesForScene,
  type SceneImageRow,
} from '@/lib/actions'

const MAX_DIM = 1600

// Ресайз на клиенте, чтобы base64 не раздувал базу: те же правила, что у обложек
async function fileToBase64(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(new Error('read'))
    r.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image()
    im.onload = () => resolve(im)
    im.onerror = () => reject(new Error('decode'))
    im.src = dataUrl
  })
  let w = img.width
  let h = img.height
  const k = Math.min(1, MAX_DIM / Math.max(w, h))
  w = Math.round(w * k)
  h = Math.round(h * k)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', 0.82)
}

export default function SceneImagesBlock({ sceneId }: { sceneId: string }) {
  const { t } = useLang()
  const [rows, setRows] = useState<SceneImageRow[]>([])
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const load = async () => setRows(await getSceneImagesForScene(sceneId))
  return (
    <div className="space-y-2 mt-3">
      <div className="field-label">{t('siTitle')}</div>
      {rows.map((im) => (
        <div key={im.id} className="card p-2 space-y-2" style={{ background: 'var(--soft-bg)' }}>
          <img
            src={im.base64}
            alt={im.caption}
            style={{
              width: im.widthPct + '%',
              display: 'block',
              margin: im.align === 'left' ? '0 auto 0 0' : im.align === 'right' ? '0 0 0 auto' : '0 auto',
              borderRadius: 6,
            }}
          />
          <input
            className="input"
            defaultValue={im.caption}
            placeholder={t('siCaptionPh')}
            onBlur={(e) => void updateSceneImage(im.id, { caption: e.target.value })}
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input w-auto"
              value={im.align}
              onChange={(e) => void updateSceneImage(im.id, { align: e.target.value })}
            >
              <option value="left">←</option>
              <option value="center">↔</option>
              <option value="right">→</option>
            </select>
            <input
              type="number"
              min={30}
              max={100}
              className="input w-auto"
              defaultValue={im.widthPct}
              onBlur={(e) => void updateSceneImage(im.id, { widthPct: Number(e.target.value) })}
            />
            <span className="text-xs" style={{ color: 'var(--soft)' }}>{t('siWidth')}</span>
            <span className="flex-1" />
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={async () => {
                await deleteSceneImage(im.id)
                await load()
              }}
            >
              <Trash2 size={13} />
            </button>
            <a
              className="btn btn-ghost btn-sm"
              href={im.base64}
              download={(im.caption || 'illustration').replace(/[\\/:*?"<>|]/g, '_') + '.jpg'}
              title={t('siDownload')}
            >
              <Download size={13} />
            </a>
          </div>
        </div>
      ))}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (!f) return
          setBusy(true)
          void (async () => {
            try {
              const base64 = await fileToBase64(f)
              const fd = new FormData()
              fd.append('image', base64)
              await createSceneImage(sceneId, fd)
              await load()
            } finally {
              setBusy(false)
            }
          })()
        }}
      />
      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <ImageIcon size={14} /> {busy ? t('cldUploading') : t('siAttach')}
        </button>
      </div>
    </div>
  )
}