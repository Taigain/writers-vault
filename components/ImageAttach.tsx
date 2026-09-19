'use client'

import { useRef, useState } from 'react'
import { Image as ImageIcon, X } from 'lucide-react'
import ZoomImage from './ZoomImage'

async function downscale(file: File, maxW: number, maxH: number, crop?: number): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = () => rej(new Error('read failed'))
    r.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = () => rej(new Error('decode failed'))
    i.src = dataUrl
  })
  let sw = img.width
  let sh = img.height
  let sx = 0
  let sy = 0
  if (crop) {
    const cur = sw / sh
    if (cur > crop) {
      sw = Math.round(sh * crop)
      sx = Math.round((img.width - sw) / 2)
    } else {
      sh = Math.round(sw / crop)
      sy = Math.round((img.height - sh) / 2)
    }
  }
  const scale = Math.min(1, maxW / sw, maxH / sh)
  const w = Math.max(1, Math.round(sw * scale))
  const h = Math.max(1, Math.round(sh * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', 0.85)
}

export default function ImageAttach({
  name,
  value,
  aspect,
  maxDim,
  labelAttach,
  labelReplace,
  labelRemove,
}: {
  name: string
  value: string | null
  aspect?: number
  maxDim?: number
  labelAttach: string
  labelReplace: string
  labelRemove: string
}) {
  const [preview, setPreview] = useState<string | null>(value)
  const [removed, setRemoved] = useState(false)
  const shown = removed ? null : preview
  const max = maxDim ?? 1200

  return (
    <div className="img-attach">
      {shown && (
        <div className="img-attach-preview" style={aspect ? { aspectRatio: `${aspect}` } : undefined}>
          <ZoomImage src={shown} />
        </div>
      )}
      <input type="hidden" name={name} value={removed ? '' : (preview ?? '')} />
      <input type="hidden" name={name + '_clear'} value={removed ? '1' : ''} />
      <div className="flex flex-wrap gap-2">
        <label className="btn btn-ghost btn-sm cursor-pointer">
          <ImageIcon size={13} /> {shown ? labelReplace : labelAttach}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              try {
                const data = aspect
                  ? await downscale(f, Math.round(max * aspect), max, aspect)
                  : await downscale(f, max, max)
                setPreview(data)
                setRemoved(false)
              } finally {
                e.target.value = ''
              }
            }}
          />
        </label>
        {shown && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setRemoved(true)
              setPreview(null)
            }}
          >
            <X size={13} /> {labelRemove}
          </button>
        )}
      </div>
    </div>
  )
}