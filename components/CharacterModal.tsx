'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Save, Plus } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import {
  saveCharacter,
  createCharacterMinimal,
  addCharacterRelation,
  removeCharacterRelation,
  getCharacterAnalytics,
  getCharacterEgo,
  setCharacterPortrait,
} from '@/lib/actions'
import { ROLES, roleLabel } from '@/lib/roles'
import CharacterTabs, { type MentionRow, type SceneRowLite, type HeatRow } from './CharacterTabs'
import type { EgoData } from './CharacterEgo'
import ImageAttach from './ImageAttach'
import type { CharRow } from './characterTypes'
import type { StrKey } from '@/lib/i18n'
import { createPortal } from 'react-dom'
import { usePremium } from './LicenseProvider'
import SoulBlock from './SoulBlock'

const DEMO: { key: string; label: StrKey }[] = [
  { key: 'birth', label: 'cdBirth' },
  { key: 'race', label: 'cdRace' },
  { key: 'country', label: 'cdCountry' },
  { key: 'language', label: 'cdLanguage' },
]
const PERSON: { key: string; label: StrKey }[] = [
  { key: 'archetype', label: 'cdArchetype' },
  { key: 'goal', label: 'cdGoal' },
  { key: 'conflict', label: 'cdConflict' },
  { key: 'trauma', label: 'cdTrauma' },
  { key: 'obsession', label: 'cdObsession' },
  { key: 'strengths', label: 'cdStrengths' },
  { key: 'weaknesses', label: 'cdWeaknesses' },
]
const LOOK: { key: string; label: StrKey }[] = [
  { key: 'height', label: 'cdHeight' },
  { key: 'weight', label: 'cdWeight' },
  { key: 'build', label: 'cdBuild' },
  { key: 'eyes', label: 'cdEyes' },
  { key: 'hair', label: 'cdHair' },
  { key: 'clothing', label: 'cdClothing' },
  { key: 'posture', label: 'cdPosture' },
  { key: 'voice', label: 'cdVoice' },
]

export default function CharacterModal({
  bookId,
  character,
  allCharacters,
  onClose,
  onCreate,
}: {
  bookId: string
  character: CharRow | null
  allCharacters: CharRow[]
  onClose: () => void
  onCreate?: (id: string) => void
}) {
  const { t, lang } = useLang()
  const { unlocked: soulUnlocked } = usePremium('seriesRelations')
  const router = useRouter()
  const [local, setLocal] = useState<CharRow | null>(character)
  const [genderDraft, setGenderDraft] = useState<string | null>(null)
  const [relations, setRelations] = useState<any[]>((character as any)?.relations ?? [])
  const [mentions, setMentions] = useState<MentionRow[]>([])
  const [scenes, setScenes] = useState<SceneRowLite[]>([])
  const [heat, setHeat] = useState<HeatRow[]>([])
  const [ego, setEgo] = useState<EgoData>({ center: null, nodes: [], edges: [] })
  const [chaptersTotal, setChaptersTotal] = useState(0)
  const [chaptersWithMentions, setChaptersWithMentions] = useState(0)
  const [totalScenes, setTotalScenes] = useState(0)
  const [withScenes, setWithScenes] = useState(0)

  useEffect(() => {
    setLocal(character)
    setGenderDraft(null)
    setRelations((character as any)?.relationsAll ?? (character as any)?.relations ?? [])
  }, [character])

  useEffect(() => {
    if (!local) return
    const id = local.id
    let cancelled = false
    ;(async () => {
      const [a, e] = await Promise.all([getCharacterAnalytics(id), getCharacterEgo(id)])
      if (cancelled) return
      setMentions(a.mentions)
      setScenes(a.scenes)
      setHeat(a.heat)
      setChaptersTotal(a.chaptersTotal)
      setChaptersWithMentions(a.chaptersWithMentions)
      setTotalScenes(a.totalScenes)
      setWithScenes(a.withScenes)
      setEgo(e)
    })()
    return () => {
      cancelled = true
    }
  }, [local?.id])

  const effectiveGender = genderDraft ?? local?.gender ?? ''
  const portraitSrc = (): string =>
    local?.portraitBase64 ??
    (effectiveGender === 'female'
      ? '/portraits/female.png'
      : effectiveGender === 'male'
        ? '/portraits/male.png'
        : '/portraits/neutral.png')

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const field = (key: string, label: StrKey) => (
    <div className="charpage-field" key={key}>
      <label>{t(label)}</label>
      <input name={key} defaultValue={(local as any)[key] ?? ''} className="input" />
    </div>
  )

  const others = allCharacters.filter((c) => c.id !== local?.id)

  const profile = local ? (
    <form
      id="charpage-form"
      className="space-y-8"
      action={async (fd: FormData) => {
        await saveCharacter(local.id, {
          name: (fd.get('name') as string) || local.name,
          role: (fd.get('role') as string) || local.role,
          aliases: (fd.get('aliases') as string) ?? '',
          bio: (fd.get('bio') as string) ?? '',
          appearance: (fd.get('appearance') as string) ?? '',
          personality: (fd.get('personality') as string) ?? '',
          decisions: (fd.get('decisions') as string) ?? '',
          arc: (fd.get('arc') as string) ?? '',
          age: (fd.get('age') as string) ?? '',
          birth: (fd.get('birth') as string) ?? '',
          race: (fd.get('race') as string) ?? '',
          country: (fd.get('country') as string) ?? '',
          language: (fd.get('language') as string) ?? '',
          archetype: (fd.get('archetype') as string) ?? '',
          goal: (fd.get('goal') as string) ?? '',
          conflict: (fd.get('conflict') as string) ?? '',
          trauma: (fd.get('trauma') as string) ?? '',
          obsession: (fd.get('obsession') as string) ?? '',
          strengths: (fd.get('strengths') as string) ?? '',
          weaknesses: (fd.get('weaknesses') as string) ?? '',
          height: (fd.get('height') as string) ?? '',
          weight: (fd.get('weight') as string) ?? '',
          build: (fd.get('build') as string) ?? '',
          eyes: (fd.get('eyes') as string) ?? '',
          hair: (fd.get('hair') as string) ?? '',
          clothing: (fd.get('clothing') as string) ?? '',
          posture: (fd.get('posture') as string) ?? '',
          voice: (fd.get('voice') as string) ?? '',
        })
        router.refresh()
      }}
    >
    <SoulBlock
      charId={local.id}
      bookId={bookId}
      charName={local.name}
      seriesCharId={local.seriesCharId ?? null}
      unlocked={soulUnlocked}
    />
      <section className="charpage-section">
        <div className="charpage-section-title">{t('cdMain')}</div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input name="name" defaultValue={local.name} className="input font-semibold max-w-xs" />
          <select name="role" defaultValue={local.role} className="input w-auto">
            {ROLES.map((r) => (
              <option key={r.key} value={r.key}>
                {lang === 'ru' ? r.ru : r.en}
              </option>
            ))}
          </select>
        </div>
        <div className="charpage-field mb-4">
          <label>{t('charAliases')}</label>
          <input
            name="aliases"
            defaultValue={local.aliases}
            className="input"
            placeholder={t('charAliasesPh')}
          />
        </div>
        <div className="charpage-field">
          <label>{t('ccBio')}</label>
          <textarea
            name="bio"
            defaultValue={local.bio}
            rows={4}
            className="textarea text-sm"
            placeholder={t('ccBioPh')}
          />
        </div>
      </section>
      <section className="charpage-section">
        <div className="charpage-section-title">{t('cdDemographics')}</div>
        <div className="charpage-grid">
          {field('age', 'cdAge')}
          {DEMO.map((f) => field(f.key, f.label))}
        </div>
      </section>
      <section className="charpage-section">
        <div className="charpage-section-title">{t('cdPersonalityDetails')}</div>
        <div className="charpage-grid mb-4">
          {PERSON.map((f) => field(f.key, f.label))}
        </div>
        <div className="charpage-grid">
          <div className="charpage-field">
            <label>{t('ccPersonality')}</label>
            <textarea
              name="personality"
              defaultValue={local.personality}
              rows={3}
              className="textarea text-sm"
              placeholder={t('ccPersonalityPh')}
            />
          </div>
          <div className="charpage-field">
            <label>{t('ccDecisions')}</label>
            <textarea
              name="decisions"
              defaultValue={local.decisions}
              rows={3}
              className="textarea text-sm"
              placeholder={t('ccDecisionsPh')}
            />
          </div>
          <div className="charpage-field" style={{ gridColumn: '1 / -1' }}>
            <label>{t('ccArc')}</label>
            <textarea
              name="arc"
              defaultValue={local.arc}
              rows={3}
              className="textarea text-sm"
              placeholder={t('ccArcPh')}
            />
          </div>
        </div>
      </section>
      <section className="charpage-section">
        <div className="charpage-section-title">{t('cdAppearanceLook')}</div>
        <div className="charpage-grid mb-4">
          {LOOK.map((f) => field(f.key, f.label))}
        </div>
        <div className="charpage-field">
          <label>{t('ccAppearance')}</label>
          <textarea
            name="appearance"
            defaultValue={local.appearance}
            rows={3}
            className="textarea text-sm"
            placeholder={t('ccAppearancePh')}
          />
        </div>
      </section>
    </form>
  ) : null

  const relationsBlock = local ? (
    <div className="space-y-3">
      {relations.length > 0 ? (
        <ul className="space-y-2">
          {relations.map((r: any) => (
            <li key={r.id} className="flex items-center gap-2 text-sm">
              <span className="chip">{r.otherName ?? r.related?.name ?? '?'}</span>
              <span style={{ color: 'var(--soft)' }}>{r.note}</span>
              {r.kind === 'oneway' && (
                <span className="text-xs" style={{ color: 'var(--soft)' }}>{r.dir === 'out' ? '→' : '←'}</span>
              )}
              <span className="flex-1" />
              <button
                type="button"
                className="mini-btn"
                onClick={async () => {
                  await removeCharacterRelation(r.id)
                  router.refresh()
                }}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('ccRelationsEmpty')}</div>
      )}
      {others.length > 0 && (
        <form
          className="flex flex-wrap gap-2 items-center"
          action={async (fd: FormData) => {
            await addCharacterRelation(local.id, fd.get('relatedId') as string, (fd.get('note') as string) ?? '')
            router.refresh()
          }}
        >
          <select name="relatedId" className="input w-auto" defaultValue="">
            <option value="" disabled>
              {t('ccRelationSelect')}
            </option>
            {others.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} — {roleLabel(o.role, lang)}
              </option>
            ))}
          </select>
          <input name="note" placeholder={t('ccRelationPh')} className="input flex-1 min-w-[180px]" />
          <button className="btn btn-ghost btn-sm">
            <Plus size={14} /> {t('ccLink')}
          </button>
        </form>
      )}
    </div>
  ) : null

  if (!mounted) return null
  return createPortal(
    <div className="charpage">
      <header className="charpage-head">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
          <X size={14} /> {t('cmClose')}
        </button>
        <div className="charpage-head-name">{local?.name ?? t('cmNew')}</div>
        {local && <span className="chip">{roleLabel(local.role, lang)}</span>}
        <span className="flex-1" />
        {local && (
          <button type="submit" form="charpage-form" className="btn btn-primary btn-sm">
            <Save size={13} /> {t('cmSave')}
          </button>
        )}
      </header>
      {!local ? (
        <div className="charpage-create">
          <form
            className="card p-6 space-y-3 w-full max-w-md"
            action={async (fd: FormData) => {
              const name = (fd.get('name') as string) || ''
              const role = (fd.get('role') as string) || 'secondary'
              const c = await createCharacterMinimal(bookId, name, role)
              if (c) {
                router.refresh()
                if (onCreate) onCreate(c.id)
                else onClose()
              }
            }}
          >
            <input name="name" required className="input font-semibold" placeholder={t('cmNamePh')} />
            <select name="role" defaultValue="secondary" className="input">
              {ROLES.map((r) => (
                <option key={r.key} value={r.key}>
                  {lang === 'ru' ? r.ru : r.en}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                {t('cmCancel')}
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={13} /> {t('cmCreate')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="charpage-body">
          <main className="min-w-0">
            <CharacterTabs
              bookId={bookId}
              name={local.name}
              profile={profile}
              relations={relationsBlock}
              mentions={mentions}
              scenes={scenes}
              heat={heat}
              chaptersTotal={chaptersTotal}
              chaptersWithMentions={chaptersWithMentions}
              totalScenes={totalScenes}
              withScenes={withScenes}
              relationsCount={relations.length}
              ego={ego}
            />
          </main>
          <aside className="charpage-aside">
            <div className="field-label">{t('cdPortrait')}</div>
            <div className="charpage-polaroid">
              <span className="charpage-initial">{local.name.charAt(0).toUpperCase()}</span>
              <img
                className="charpage-polaroid-img"
                src={portraitSrc()}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <form
              className="space-y-2"
              action={async (fd: FormData) => {
                await setCharacterPortrait(local.id, fd)
                router.refresh()
              }}
            >
              <div className="charpage-field">
                <label>{t('cdGender')}</label>
                <select
                  name="gender"
                  defaultValue={local.gender ?? ''}
                  className="input"
                  onChange={(e) => setGenderDraft(e.target.value)}
                >
                  <option value="">{t('cdGenderX')}</option>
                  <option value="male">{t('cdGenderM')}</option>
                  <option value="female">{t('cdGenderF')}</option>
                </select>
              </div>
              <ImageAttach
                name="portrait"
                value={local.portraitBase64}
                aspect={3 / 4}
                maxDim={900}
                showPreview={false}
                labelAttach={t('ccPortraitAttach')}
                labelReplace={t('ccPortraitReplace')}
                labelRemove={t('ccPortraitRemove')}
              />
              <button type="submit" className="btn btn-ghost btn-sm w-full">
                <Save size={13} /> {t('cmSave')}
              </button>
            </form>
            {!local.portraitBase64 && effectiveGender && (
              <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('cdPortraitAuto')}</div>
            )}
          </aside>
        </div>
      )}
    </div>,
    document.body,
  )
}