'use client'

import { useEffect, useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { getChapterSceneImages, type SceneImageRow } from '@/lib/actions'

export default function InsertImageDialog({
  chapterId,
  onClose,
  onInsert,
}: {
  chapterId: string
  onClose: () => void
  onInsert: (marker: string) => void
}) {
  const { t } = useLang()
  const [rows, setRows] = useState<{ sceneId: string; sceneTitle: string; images: SceneImageRow[] }[]>([])
  useEffect(() => {
    void getChapterSceneImages(chapterId).then(setRows)
  }, [chapterId])
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ background: 'rgba(20, 17, 14, 0.5)', zIndex: 340 }}
      onClick={onClose}
    >
      <div className="card p-5 w-full max-w-lg space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="font-bold">{t('siDialog')}</div>
        <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('siPick')}</div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {rows.map((r) => (
            <div key={r.sceneId} className="space-y-2">
              <div className="text-sm font-semibold">{r.sceneTitle}</div>
              {r.images.length === 0 && (
                <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('siNoImages')}</div>
              )}
              <div className="flex flex-wrap gap-2">
                {r.images.map((im) => (
                  <button
                    key={im.id}
                    type="button"
                    title={im.caption || im.id}
                    onClick={() => onInsert('[img:' + im.id + ']')}
                  >
                    <img
                      src={im.base64}
                      alt={im.caption}
                      style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--line)' }}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="text-sm" style={{ color: 'var(--soft)' }}>{t('siNoScenes')}</div>
          )}
        </div>
        <div className="flex justify-end">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            {t('cmClose')}
          </button>
        </div>
      </div>
    </div>
  )
}