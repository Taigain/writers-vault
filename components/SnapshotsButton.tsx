'use client'

import { useEffect, useState } from 'react'
import { History, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/useLang'
import {
  getBookSnapshots,
  restoreSnapshot,
  deleteSnapshot,
  createManualSnapshot,
  type SnapshotRow,
} from '@/lib/actions'

export default function SnapshotsButton({ bookId }: { bookId: string }) {
  const { t, lang } = useLang()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<SnapshotRow[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const load = async () => setRows(await getBookSnapshots(bookId))
  useEffect(() => {
    if (open) void load()
  }, [open, bookId])
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
        <History size={14} /> {t('snTitle')}
      </button>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{ background: 'rgba(20, 17, 14, 0.5)', zIndex: 340 }}
          onClick={() => setOpen(false)}
        >
          <div className="card p-5 w-full max-w-lg space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold">{t('snTitle')}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={async () => {
                  await createManualSnapshot(bookId)
                  await load()
                }}
              >
                <Save size={13} /> {t('snTake')}
              </button>
            </div>
            <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('snHint')}</div>
            {rows.length === 0 && (
              <div className="text-sm" style={{ color: 'var(--soft)' }}>{t('snEmpty')}</div>
            )}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {rows.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <code className="chip">{fmt(r.createdAt)}</code>
                  <span className="flex-1 truncate" style={{ color: 'var(--soft)' }}>{r.label}</span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={busy === r.id}
                    onClick={async () => {
                      if (!window.confirm(t('snRestoreConfirm', { when: fmt(r.createdAt) }))) return
                      setBusy(r.id)
                      await restoreSnapshot(r.id)
                      setBusy(null)
                      setOpen(false)
                      router.refresh()
                    }}
                  >
                    {t('snRestore')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={async () => {
                      await deleteSnapshot(r.id)
                      await load()
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                {t('cmClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}