export function downloadDataUrl(src: string, name: string) {
  const comma = src.indexOf(',')
  if (comma < 0) return
  const meta = src.slice(0, comma)
  const b64 = src.slice(comma + 1)
  const mime = /data:(.*?);/.exec(meta)?.[1] ?? 'image/jpeg'
  const ext = mime.includes('png') ? 'png' : mime.includes('gif') ? 'gif' : mime.includes('webp') ? 'webp' : 'jpg'
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const blob = new Blob([bytes], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name.replace(/[\\/:*?"<>|]/g, '_').slice(0, 80) || 'image'}.${ext}`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}