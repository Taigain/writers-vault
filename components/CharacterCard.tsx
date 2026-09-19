import { Save, Plus, X, Link2, Clock, ChevronRight } from 'lucide-react'
import { getCharacters, saveCharacter, addCharacterRelation, removeCharacterRelation, deleteCharacter, readImageField } from '@/lib/actions'
import DeleteButton from './DeleteButton'
import { ROLES, roleLabel } from '@/lib/roles'
import { getLang } from '@/lib/lang-server'
import { tr, type StrKey } from '@/lib/i18n'
import ImageAttach from './ImageAttach'
import ZoomImage from './ZoomImage'

type CharacterDetailed = Awaited<ReturnType<typeof getCharacters>>[number]

const FIELDS: {
  key: 'bio' | 'appearance' | 'personality' | 'decisions' | 'arc'
  label: StrKey
  placeholder: StrKey
  wide?: boolean
}[] = [
  { key: 'bio', label: 'ccBio', placeholder: 'ccBioPh', wide: true },
  { key: 'appearance', label: 'ccAppearance', placeholder: 'ccAppearancePh' },
  { key: 'personality', label: 'ccPersonality', placeholder: 'ccPersonalityPh' },
  { key: 'decisions', label: 'ccDecisions', placeholder: 'ccDecisionsPh' },
  { key: 'arc', label: 'ccArc', placeholder: 'ccArcPh' },
]

export default async function CharacterCard({
  character,
  allCharacters,
}: {
  character: CharacterDetailed
  allCharacters: CharacterDetailed[]
}) {
  const lang = await getLang()
  const others = allCharacters.filter((c) => c.id !== character.id)

  return (
    <details className="acc">
      <summary className="acc-head">
        <ChevronRight size={18} className="acc-chev" />
        {character.portraitBase64 ? (
          <span className="avatar avatar-img">
            <ZoomImage src={character.portraitBase64} />
          </span>
        ) : (
          <div className="avatar">{character.name.charAt(0).toUpperCase()}</div>
        )}
        <span className="acc-title">{character.name}</span>
        <span className="chip">{roleLabel(character.role, lang)}</span>
      </summary>
      <div className="acc-body">
        <form
          action={async (fd: FormData) => {
            'use server'
            const img = await readImageField(fd, 'portrait')
            await saveCharacter(character.id, {
              name: (fd.get('name') as string) || character.name,
              role: (fd.get('role') as string) || character.role,
              bio: (fd.get('bio') as string) ?? '',
              aliases: (fd.get('aliases') as string) ?? '',
              appearance: (fd.get('appearance') as string) ?? '',
              personality: (fd.get('personality') as string) ?? '',
              decisions: (fd.get('decisions') as string) ?? '',
              arc: (fd.get('arc') as string) ?? '',
              portraitBase64: img.clear ? null : img.keep ? undefined : img.value,
            })
          }}
          className="space-y-4 pt-4"
        >
          <div className="flex flex-wrap items-center gap-3">
            <input name="name" defaultValue={character.name} className="input font-semibold max-w-xs" />
            <div className="flex items-center gap-2">
              <span className="field-label" style={{ marginBottom: 0 }}>{tr(lang, 'ccRole')}</span>
              <select name="role" defaultValue={character.role} className="input w-auto">
                {ROLES.map((r) => (
                  <option key={r.key} value={r.key}>{lang === 'ru' ? r.ru : r.en}</option>
                ))}
              </select>
            </div>
            <div className="flex-1" />
            <DeleteButton
              onConfirm={async () => {
                'use server'
                await deleteCharacter(character.id)
              }}
              label={tr(lang, 'ccDelete')}
              confirmText={tr(lang, 'ccDeleteConfirm', { name: character.name })}
            />

        <button type="submit" className="btn btn-primary btn-sm">
          <Save size={14} /> {tr(lang, 'ccSave')}
        </button>
        </div>
      <div>
        <label className="field-label">{tr(lang, 'charAliases')}</label>
        <input
          name="aliases"
          defaultValue={character.aliases}
          className="input"
          placeholder={tr(lang, 'charAliasesPh')}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4"></div>
        <ImageAttach
          name="portrait"
          value={character.portraitBase64}
          aspect={3 / 4}
          maxDim={900}
          labelAttach={tr(lang, 'ccPortraitAttach')}
          labelReplace={tr(lang, 'ccPortraitReplace')}
          labelRemove={tr(lang, 'ccPortraitRemove')}
        />
          <div className="grid md:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={f.key} className={f.wide ? 'md:col-span-2' : ''}>
                <label className="field-label">{tr(lang, f.label)}</label>
                <textarea
                  name={f.key}
                  defaultValue={character[f.key]}
                  rows={f.wide ? 3 : 4}
                  className="textarea text-sm"
                  placeholder={tr(lang, f.placeholder)}
                />
              </div>
            ))}
          </div>
        </form>

        <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--soft)' }}>
            <Link2 size={12} /> {tr(lang, 'ccRelations')}
          </div>

          {character.relations.length > 0 && (
            <div className="space-y-2 mb-3">
              {character.relations.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span className="chip chip-mention">{r.related.name}</span>
                  <span className="text-sm flex-1" style={{ color: 'var(--soft)' }}>{r.note}</span>
                  <form
                    action={async () => {
                      'use server'
                      await removeCharacterRelation(r.id)
                    }}
                  >
                    <button type="submit" className="btn btn-ghost btn-sm" title={tr(lang, 'ccDelete')}>
                      <X size={13} />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}

          {others.length > 0 ? (
            <form
              action={async (fd: FormData) => {
                'use server'
                await addCharacterRelation(
                  character.id,
                  fd.get('relatedId') as string,
                  (fd.get('note') as string) ?? '',
                )
              }}
              className="flex flex-wrap gap-2 items-center"
            >
              <select name="relatedId" className="input w-auto" defaultValue="">
                <option value="" disabled>{tr(lang, 'ccRelationSelect')}</option>
                {others.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} — {roleLabel(o.role, lang)}
                  </option>
                ))}
              </select>
              <input name="note" placeholder={tr(lang, 'ccRelationPh')} className="input flex-1 min-w-[180px]" />
              <button className="btn btn-ghost btn-sm">
                <Plus size={14} /> {tr(lang, 'ccLink')}
              </button>
            </form>
          ) : (
            <div className="text-xs" style={{ color: 'var(--soft)' }}>
              {tr(lang, 'ccRelationsEmpty')}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--soft)' }}>
            <Clock size={12} /> {tr(lang, 'ccHistory')}
          </div>
          {character.mentions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {character.mentions.map((m) => (
                <span key={m.id} className="chip chip-mention">{m.chapter.title}</span>
              ))}
            </div>
          ) : (
            <div className="text-xs" style={{ color: 'var(--soft)' }}>
              {tr(lang, 'ccHistoryEmpty', { name: character.name })}
            </div>
          )}
        </div>
      </div>
    </details>
  )
}