'use client'

import { Edit3, Copy, Trash2 } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { roleLabel } from '@/lib/roles'
import { deleteCharacter, duplicateCharacter } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import type { CharRow } from './characterTypes'
import { portraitSrc } from '@/lib/portrait'

function seedRand(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return ((h & 0x7fffffff) % 1000) / 1000
}

export default function CharacterTile({ character, onOpen }: { character: CharRow; onOpen: () => void }) {
  const { t, lang } = useLang()
  const router = useRouter()
  const r = seedRand(character.id)
  const rotation = (r - 0.5) * 6
  const tx = (r * 2 - 1) * 5
  const ty = (seedRand(character.id + 'y') * 2 - 1) * 4
  const firstLine = (character.bio || character.personality || '').split('\n')[0]
  const snippet = firstLine.length > 70 ? firstLine.slice(0, 70) + '…' : firstLine
  return (
    <div
      className="cr-tile cr-polaroid"
      style={{
        transform: `translate(${tx}px, ${ty}px) rotate(${rotation}deg)`,
      }}
    >
      <button type="button" className="cr-polaroid-photo" onClick={onOpen}>
        <span className="cr-polaroid-initial">{character.name.charAt(0).toUpperCase()}</span>
        <img
          className="cr-photo-img"
          src={portraitSrc(character)}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </button>
      <div className="cr-polaroid-body">
        <div className="cr-polaroid-name">{character.name}</div>
        <div className="cr-polaroid-role">{roleLabel(character.role, lang)}</div>
        {character.soul && character.soul.books.length > 0 && (
          <div className="cr-polaroid-soul" title={character.soul.name}>
            {t('scAlsoIn', { books: character.soul.books.join(', ') })}
          </div>
        )}
        {snippet && <div className="cr-polaroid-snippet">{snippet}</div>}
      </div>
      <div className="cr-polaroid-actions" onClick={(e) => e.stopPropagation()}>
        <button type="button" title={t('crEdit')} onClick={onOpen}>
          <Edit3 size={13} />
        </button>
        <button
          type="button"
          title={t('crDuplicate')}
          onClick={async () => {
            await duplicateCharacter(character.id)
            router.refresh()
          }}
        >
          <Copy size={13} />
        </button>
        <button
          type="button"
          title={t('crDelete')}
          onClick={async () => {
            if (window.confirm(t('crDeleteConfirm', { name: character.name }))) {
              await deleteCharacter(character.id)
              router.refresh()
            }
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}