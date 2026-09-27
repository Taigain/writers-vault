'use client'

import { Download } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { downloadDataUrl } from '@/lib/imgutil'

export default function DownloadImage({ src, name }: { src: string; name: string }) {
  const { t } = useLang()
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      title={t('imgDownload')}
      onClick={() => downloadDataUrl(src, name)}
    >
      <Download size={13} /> {t('imgDownload')}
    </button>
  )
}