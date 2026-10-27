'use client'

import { useEffect, useState } from 'react'
import { CloudUpload, Search, Plus, Trash2 } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import {
  detectCloudClients,
  getCloudTargets,
  addCloudTarget,
  removeCloudTarget,
  type CloudTargetRow,
} from '@/lib/actions'
import type { DetectedClient } from '@/lib/cloudScan'

export default function CloudBackupSection() {
  const { t, lang } = useLang()
  const [targets, setTargets] = useState<CloudTargetRow[]>([])
  const [found, setFound] = useState<DetectedClient[] | null>(null)
  const [manual, setManual] = useState('')
  const load = async () => setTargets(await getCloudTargets())
  useEffect(() => {
    void load()
  }, [])
  const provLabel = (p: string) =>
    p === 'yandex'
      ? t('cldProvYandex')
      : p === 'dropbox'
        ? t('cldProvDropbox')
        : p === 'onedrive'
          ? t('cldProvOnedrive')
          : p === 'gdrive'
            ? t('cldProvGdrive')
            : t('cldProvCustom')
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  return (
    <div className="card p-4 space-y-3">
      <div className="field-label">{t('cldTitle')}</div>
      <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('cldSub')}</div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={async () => setFound(await detectCloudClients())}>
          <Search size={13} /> {t('cldScan')}
        </button>
      </div>
      {found && found.length === 0 && (
        <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('cldScanEmpty')}</div>
      )}
      {found && found.length > 0 && (
        <div className="space-y-2">
          {found
            .filter((f) => !targets.some((tg) => tg.rootPath.toLowerCase() === f.rootPath.toLowerCase()))
            .map((f) => (
              <div key={f.provider + f.rootPath} className="flex flex-wrap items-center gap-2 text-sm">
                <CloudUpload size={14} style={{ color: 'var(--gold)' }} />
                <span className="font-semibold">{provLabel(f.provider)}</span>
                <code className="text-xs flex-1 truncate" style={{ color: 'var(--soft)' }}>{f.rootPath}</code>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={async () => {
                    await addCloudTarget(f.provider, provLabel(f.provider), f.rootPath)
                    await load()
                  }}
                >
                  <Plus size={13} /> {t('cldAdd')}
                </button>
              </div>
            ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <input className="input flex-1" value={manual} onChange={(e) => setManual(e.target.value)} placeholder={t('cldPathPh')} />
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={async () => {
            await addCloudTarget('custom', t('cldProvCustom'), manual)
            setManual('')
            await load()
          }}
        >
          <Plus size={13} /> {t('cldAddCustom')}
        </button>
      </div>
      <div className="space-y-2">
        {targets.map((tg) => (
          <div key={tg.id} className="flex flex-wrap items-center gap-2 text-sm">
            <CloudUpload size={14} style={{ color: 'var(--gold)' }} />
            <span className="font-semibold">{tg.name}</span>
            <code className="text-xs truncate" style={{ color: 'var(--soft)', maxWidth: 260 }}>{tg.rootPath}</code>
            <span className="text-xs flex-1" style={{ color: tg.lastStatus === 'ok' || !tg.lastStatus ? 'var(--soft)' : 'var(--danger, #b3261e)' }}>
              {t('cldLast')}: {tg.lastRunAt ? `${fmt(tg.lastRunAt)} · ${tg.lastStatus === 'ok' ? t('cldOk') : tg.lastStatus}` : t('cldNever')}
            </span>
            <button type="button" className="btn btn-danger btn-sm" onClick={async () => { await removeCloudTarget(tg.id); await load() }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}