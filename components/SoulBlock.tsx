'use client'

import { useEffect, useState } from 'react'
import { Link2, Link2Off, Star } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import {
  createSoulFromCharacter,
  linkCharacterToSoul,
  unlinkCharacterFromSoul,
  setSoulCanon,
  getSeriesCast,
  type SeriesCast,
} from '@/lib/actions'

export default function SoulBlock({
  charId,
  bookId,
  charName,
  seriesCharId,
  unlocked,
}: {
  charId: string
  bookId: string
  charName: string
  seriesCharId: string | null
  unlocked: boolean
}) {
  const { t } = useLang()
  const [cast, setCast] = useState<SeriesCast | null>(null)
  const load = async () => setCast(await getSeriesCast(bookId))
  useEffect(() => {
    if (unlocked) void load()
  }, [bookId, unlocked])
  if (!unlocked || !cast?.series) return null
  const soul = cast.souls.find((s) => s.id === seriesCharId) ?? null
  const suggest = !soul
    ? cast.souls.find((s) => s.name.trim().toLowerCase() === charName.trim().toLowerCase())
    : null
  const linkable = cast.souls.filter((s) => s.id !== seriesCharId)
  return (
    <div className="card p-4 space-y-2">
      <div className="field-label">{t('scSoulBlock')}</div>
      {soul ? (
        <>
          <div className="text-sm font-semibold">
            {t('scSoulOf', { name: soul.name })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {soul.doubles.map((d) => (
              <span key={d.id} className="chip" style={d.id === charId ? { borderColor: 'var(--gold)' } : undefined}>
                {d.bookTitle}
                {d.id === soul.canonId ? ' ★' : ''}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {soul.canonId !== charId && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={async () => { await setSoulCanon(charId); await load() }}>
                <Star size={13} /> {t('scCanon')}
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-sm" onClick={async () => { await unlinkCharacterFromSoul(charId); await load() }}>
              <Link2Off size={13} /> {t('scSoulUnlink')}
            </button>
          </div>
        </>
      ) : (
        <>
          {suggest && (
            <div className="text-xs" style={{ color: 'var(--gold)' }}>
              {t('scSoulSuggest', { name: suggest.name })}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={async () => { await createSoulFromCharacter(charId); await load() }}>
              <Link2 size={13} /> {t('scSoulCreate')}
            </button>
            {linkable.length > 0 && (
              <select
                className="input w-auto"
                defaultValue=""
                onChange={(e) => {
                  const v = e.target.value
                  if (!v) return
                  void linkCharacterToSoul(charId, v).then(load)
                  e.target.value = ''
                }}
              >
                <option value="" disabled>{t('scSoulLink')}</option>
                {linkable.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>
        </>
      )}
    </div>
  )
}