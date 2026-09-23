'use client'

import { useRef, useState } from 'react'
import { Save, Image as ImageIcon, Trash2 } from 'lucide-react'
import { saveBook, removeBookCover, setBookStatus } from '@/lib/actions'
import { useLang } from '@/lib/useLang'
import SeriesPicker from './SeriesPicker'
import ExportMetaToggle from './ExportMetaToggle'

const ANN_LIMIT = 800
const SYN_LIMIT = 5000

export type SeriesOption = { id: string; name: string }

export default function BookPassport({
  id,
  title,
  coverBase64,
  annotation,
  synopsis,
  series,
  seriesId,
  status,
  exportMeta,
}: {
  id: string
  title: string
  coverBase64: string | null
  annotation: string
  synopsis: string
  series: SeriesOption[]
  seriesId: string | null
  status: string
  exportMeta: boolean
}) {
  const { t } = useLang()
  const [annLen, setAnnLen] = useState(annotation.length)
  const [synLen, setSynLen] = useState(synopsis.length)
  const [preview, setPreview] = useState<string | null>(coverBase64)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const onCoverChange = (file: File | null) => {
    if (!file || file.size === 0) return
    const reader = new FileReader()
    reader.onload = () => setPreview(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
  }

  return (
    <form
      action={async (fd: FormData) => {
        await saveBook(id, fd)
      }}
      className="card p-5 space-y-4"
    >
      <div>
        <div className="field-label">{t('bpStatus')}</div>
        <div className="flex flex-wrap gap-2">
          {(['idea', 'active', 'archive'] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`chip-btn ${status === st ? 'chip-btn-active' : ''}`}
              onClick={() => setBookStatus(id, st)}
            >
              {t(st === 'idea' ? 'bpStatusIdea' : st === 'active' ? 'bpStatusActive' : 'bpStatusArchive')}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-wrap items-start gap-5">
        <div className="w-24 h-32 rounded-lg overflow-hidden shrink-0 shadow-md bg-[#f1e9db] flex items-center justify-center text-[#7a5c22]">
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-write text-3xl">{title.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="flex-1 min-w-[260px] space-y-3">
          <div>
            <label className="field-label">{t('bpTitle')}</label>
            <input name="title" defaultValue={title} required className="input font-semibold" />
          </div>

          <SeriesPicker bookId={id} series={series} seriesId={seriesId} />

          <div>
            <div className="flex items-center justify-between">
              <label className="field-label">{t('bpAnnotation')}</label>
              <span className="text-xs" style={{ color: annLen >= ANN_LIMIT ? '#8c3a2b' : 'var(--soft)' }}>
                {annLen} / {ANN_LIMIT}
              </span>
            </div>
            <textarea
              name="annotation"
              defaultValue={annotation}
              maxLength={ANN_LIMIT}
              rows={3}
              onInput={(e) => setAnnLen(e.currentTarget.value.length)}
              className="textarea text-sm"
              placeholder={t('bpAnnPh')}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="field-label">{t('bpSynopsis')}</label>
              <span className="text-xs" style={{ color: synLen >= SYN_LIMIT ? '#8c3a2b' : 'var(--soft)' }}>
                {synLen} / {SYN_LIMIT}
              </span>
            </div>
            <textarea
              name="synopsis"
              defaultValue={synopsis}
              maxLength={SYN_LIMIT}
              rows={6}
              onInput={(e) => setSynLen(e.currentTarget.value.length)}
              className="textarea text-sm"
              placeholder={t('bpSynPh')}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-end">
        <div className="mr-auto">
          <ExportMetaToggle bookId={id} initial={exportMeta} />
        </div>
        <label className="btn btn-ghost btn-sm cursor-pointer">
          <ImageIcon size={13} /> {preview ? t('bpCoverReplace') : t('bpCoverUpload')}
          <input
            ref={fileRef}
            type="file"
            name="cover"
            accept="image/*"
            className="hidden"
            onChange={(e) => onCoverChange(e.target.files?.[0] ?? null)}
          />
        </label>
        {preview && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              setPreview(null)
              if (fileRef.current) fileRef.current.value = ''
              await removeBookCover(id)
            }}
          >
            <Trash2 size={13} /> {t('bpCoverRemove')}
          </button>
        )}
        <button type="submit" className="btn btn-primary btn-sm">
          <Save size={13} /> {t('bpSave')}
        </button>
      </div>
    </form>
  )
}