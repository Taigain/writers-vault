'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, LayoutGrid, Network, Search, Plus, X } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { addCharacterRelation } from '@/lib/actions'
import CharacterTile from './CharacterTile'
import CharacterBoard from './CharacterBoard'
import CharacterModal from './CharacterModal'
import RelateDialog from './RelateDialog'
import type { CharRow, CharRelation } from './characterTypes'

export default function CharactersRegistry({
  bookId,
  characters,
  relations,
  boardHeight,
}: {
  bookId: string
  characters: CharRow[]
  relations: CharRelation[]
  boardHeight: number | null
}) {
  const { t } = useLang()
  const router = useRouter()
  const [view, setView] = useState<'grid' | 'board'>('grid')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [relatePair, setRelatePair] = useState<{ a: string; b: string } | null>(null)
  const s = q.trim().toLowerCase()
  const filtered = s
    ? characters.filter((c) =>
        (c.name + ' ' + c.role + ' ' + c.bio + ' ' + c.aliases).toLowerCase().includes(s),
      )
    : characters
  const openChar = characters.find((c) => c.id === openId) ?? null
  return (
    <div>
      <div className="cr-toolbar">
        <div className="cr-search">
          <Search size={14} style={{ color: 'var(--soft)' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('crSearch')}
            className="cr-search-input"
          />
          {q && (
            <button type="button" onClick={() => setQ('')}>
              <X size={12} />
            </button>
          )}
        </div>
        <div className="cr-views">
          <button
            type="button"
            className={`cr-view-btn ${view === 'grid' ? 'cr-view-active' : ''}`}
            onClick={() => setView('grid')}
          >
            <LayoutGrid size={13} /> {t('crViewGrid')}
          </button>
          <button
            type="button"
            className={`cr-view-btn ${view === 'board' ? 'cr-view-active' : ''}`}
            onClick={() => setView('board')}
          >
            <Network size={13} /> {t('crViewBoard')}
          </button>
        </div>
      </div>
      {view === 'grid' ? (
        <div className="cr-grid">
          <button type="button" className="cr-tile cr-tile-new" onClick={() => setCreating(true)}>
            <Plus size={22} />
            <span>{t('crNew')}</span>
          </button>
          {filtered.map((c) => (
            <CharacterTile key={c.id} character={c} onOpen={() => setOpenId(c.id)} />
          ))}
          {filtered.length === 0 && characters.length > 0 && (
            <div className="cr-empty">{t('crNotFound')}</div>
          )}
        </div>
      ) : (
        <CharacterBoard
          bookId={bookId}
          characters={filtered}
          relations={relations}
          boardHeight={boardHeight}
          onOpen={(id) => setOpenId(id)}
          onNew={() => setCreating(true)}
          onRelate={(a, b) => setRelatePair({ a, b })}
        />
      )}
      {characters.length === 0 && (
        <div className="cr-empty-hero">
          <Users size={28} style={{ color: 'var(--soft)' }} />
          <div className="cr-empty-title">{t('crEmpty')}</div>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>
            <Plus size={13} /> {t('crNew')}
          </button>
        </div>
      )}
      {(openChar || creating) && (
        <CharacterModal
          bookId={bookId}
          character={openChar}
          allCharacters={characters}
          onClose={() => {
            setOpenId(null)
            setCreating(false)
          }}
          onCreate={(nid) => {
            setCreating(false)
            setOpenId(nid)
          }}
        />
      )}
      {relatePair && (
        <RelateDialog
          aName={characters.find((c) => c.id === relatePair.a)?.name ?? ''}
          bName={characters.find((c) => c.id === relatePair.b)?.name ?? ''}
          onClose={() => setRelatePair(null)}
          onSave={async (kind, note) => {
            await addCharacterRelation(relatePair.a, relatePair.b, note, kind)
            setRelatePair(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}