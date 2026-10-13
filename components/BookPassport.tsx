'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Image as ImageIcon, Trash2, Plus, Download, X } from 'lucide-react'
import {
  saveBook,
  removeBookCover,
  setBookStatus,
  setBookSeries,
  createSeriesNamed,
} from '@/lib/actions'
import { useLang } from '@/lib/useLang'
import ExportMetaToggle from './ExportMetaToggle'
import DownloadImage from './DownloadImage'

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
  exportTitle,
  exportAnnotation,
  exportSynopsis,
}: {
  id: string
  title: string
  coverBase64: string | null
  annotation: string
  synopsis: string
  series: SeriesOption[]
  seriesId: string | null
  status: string
  exportTitle: boolean
  exportAnnotation: boolean
  exportSynopsis: boolean
}) {
  const { t } = useLang()
  const router = useRouter()
  const [annLen, setAnnLen] = useState(annotation.length)
  const [synLen, setSynLen] = useState(synopsis.length)
  const [preview, setPreview] = useState<string | null>(coverBase64)
  const [seriesNewOpen, setSeriesNewOpen] = useState(false)
  const [seriesNewName, setSeriesNewName] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)

  const onCoverChange = (file: File | null) => {
    if (!file || file.size === 0) return
    const reader = new FileReader()
    reader.onload = () => setPreview(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
  }

  const applySeries = async (v: string) => {
    if (v === '__new') {
      setSeriesNewOpen(true)
      return
    }
    setSeriesNewOpen(false)
    await setBookSeries(id, v || null)
    router.refresh()
  }

  const createSeriesInline = async () => {
    const newId = await createSeriesNamed(seriesNewName)
    if (newId) {
      await setBookSeries(id, newId)
      setSeriesNewName('')
      setSeriesNewOpen(false)
      router.refresh()
    }
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
          <div>
            <label className="field-label">{t('cbSeries')}</label>
            <select
              className="input"
              value={seriesNewOpen ? '__new' : seriesId ?? ''}
              onChange={(e) => applySeries(e.target.value)}
            >
              <option value="">{t('cbSeriesNone')}</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
              <option value="__new">{t('cbSeriesNew')}</option>
            </select>
            {seriesNewOpen && (
              <div className="flex gap-2 mt-2">
                <input
                  className="input flex-1"
                  value={seriesNewName}
                  onChange={(e) => setSeriesNewName(e.target.value)}
                  placeholder={t('cbSeriesNewPh')}
                  autoFocus
                />
                <button type="button" className="btn btn-primary btn-sm" onClick={() => void createSeriesInline()}>
                  <Plus size={13} /> {t('homeCreate')}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setSeriesNewOpen(false)
                    setSeriesNewName('')
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
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
          <ExportMetaToggle
            bookId={id}
            initial={{ title: exportTitle, annotation: exportAnnotation, synopsis: exportSynopsis }}
          />
        </div>
        <a
          className="btn btn-ghost btn-sm"
          href={`/api/project/export?bookId=${id}&name=${encodeURIComponent(title)}`}
        >
          <Download size={13} /> {t('ppExport')}
        </a>
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
        {preview && <DownloadImage src={preview} name={title} />}
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