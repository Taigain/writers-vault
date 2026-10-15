import { PenLine, BookOpen, Library, Users, CalendarClock, Clapperboard, Crown } from 'lucide-react'
import { getAuthorProfile, getProfileStats, saveAuthorProfile } from '@/lib/actions'
import { getLang } from '@/lib/lang-server'
import { tr } from '@/lib/i18n'

export default async function ProfilePage() {
  const lang = await getLang()
  const profile = await getAuthorProfile()
  const stats = await getProfileStats()
  const fmt = (n: number) => n.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US')
  const rows = [
    { Icon: PenLine, label: tr(lang, 'pfStatWords'), value: stats.words },
    { Icon: BookOpen, label: tr(lang, 'pfStatBooks'), value: stats.books },
    { Icon: Library, label: tr(lang, 'pfStatSeries'), value: stats.series },
    { Icon: Users, label: tr(lang, 'pfStatCharacters'), value: stats.characters },
    { Icon: CalendarClock, label: tr(lang, 'pfStatEvents'), value: stats.events },
    { Icon: Clapperboard, label: tr(lang, 'pfStatScenes'), value: stats.scenes },
  ]
  const since = profile.createdAt.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return (
    <div className="page-wrap mx-auto px-8 py-8 anim-fade">
      <div className="pf-head">
        <div className="pf-title">{tr(lang, 'pfTitle')}</div>
        <div className="pf-sub">{tr(lang, 'pfSub')}</div>
      </div>
      <div className="pf-grid">
        <form className="card p-5 space-y-3" action={saveAuthorProfile}>
          <div className="pf-row">
            <div className="pf-avatar">{(profile.name || tr(lang, 'pfAuthor')).charAt(0).toUpperCase()}</div>
            <div className="min-w-0">
              <div className="font-bold text-lg truncate">{profile.name || tr(lang, 'pfAuthor')}</div>
              <div className="text-xs" style={{ color: 'var(--soft)' }}>{tr(lang, 'pfSince', { date: since })}</div>
            </div>
          </div>
          <div>
            <label className="field-label">{tr(lang, 'pfName')}</label>
            <input name="name" defaultValue={profile.name} className="input" placeholder={tr(lang, 'pfNamePh')} />
          </div>
          <div>
            <label className="field-label">{tr(lang, 'pfPenNames')}</label>
            <input name="penNames" defaultValue={profile.penNames} className="input" placeholder={tr(lang, 'pfPenNamesPh')} />
          </div>
          <div>
            <label className="field-label">{tr(lang, 'pfGenres')}</label>
            <input name="genres" defaultValue={profile.genres} className="input" placeholder={tr(lang, 'pfGenresPh')} />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary btn-sm">{tr(lang, 'pfSave')}</button>
          </div>
        </form>
        <div className="card p-5 flex flex-col items-center justify-center gap-3 text-center">
          <div className="field-label">{tr(lang, 'pfPlan')}</div>
          <div className="pf-plan-name">{tr(lang, 'pfPlanFree')}</div>
          <span className="chip">{tr(lang, 'pfInDev')}</span>
          <button type="button" className="btn btn-primary btn-sm" disabled style={{ opacity: 0.55, cursor: 'not-allowed' }}>
            <Crown size={13} /> {tr(lang, 'pfUpgrade')}
          </button>
          <div className="text-xs" style={{ color: 'var(--soft)' }}>{tr(lang, 'pfPlanHint')}</div>
        </div>
      </div>
      <div className="pf-activity">
        <div className="pf-activity-title">{tr(lang, 'pfActivity')}</div>
        <div className="card">
          {rows.map((r) => (
            <div key={r.label} className="pf-stat-row">
              <r.Icon size={16} style={{ color: 'var(--soft)' }} />
              <span className="pf-stat-label">{r.label}</span>
              <span className="pf-stat-val">
                <b>{fmt(r.value)}</b>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}