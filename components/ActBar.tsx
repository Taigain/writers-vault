'use client'

import { useState } from 'react'
import { Landmark, Pencil, Check, Plus, ArrowUp, ArrowDown } from 'lucide-react'
import DeleteButton from './DeleteButton'
import { renameActInBook, deleteActInBook, createChapterInAct, moveBlock } from '@/lib/actions'
import { useLang } from '@/lib/useLang'

export default function ActBar({
  bookId,
  name,
  blockIndex,
  blockTotal,
}: {
  bookId: string
  name: string
  blockIndex: number
  blockTotal: number
}) {
  const { t } = useLang()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  return (
    <div className="act-bar">
      <Landmark size={15} className="shrink-0" style={{ color: 'var(--gold)' }} />
      {editing ? (
        <>
          <input
            className="input flex-1"
            style={{ padding: '.3rem .5rem', fontSize: '.85rem' }}
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              const v = draft.trim()
              if (v && v !== name) await renameActInBook(bookId, name, v)
              setEditing(false)
            }}
          >
            <Check size={13} /> {t('pgActSave')}
          </button>
        </>
      ) : (
        <>
          <span className="font-bold flex-1 truncate">{name}</span>
          <button
            type="button"
            className="mini-btn"
            title={t('pgActMoveUp')}
            disabled={blockIndex <= 0}
            onClick={async () => {
              await moveBlock(bookId, 'a:' + name, -1)
            }}
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            className="mini-btn"
            title={t('pgActMoveDown')}
            disabled={blockIndex >= blockTotal - 1}
            onClick={async () => {
              await moveBlock(bookId, 'a:' + name, 1)
            }}
          >
            <ArrowDown size={13} />
          </button>
          <button
            type="button"
            className="mini-btn"
            title={t('pgActRename')}
            onClick={() => {
              setDraft(name)
              setEditing(true)
            }}
          >
            <Pencil size={13} />
          </button>
        </>
      )}
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        title={t('pgActAddChapter')}
        onClick={async () => {
          await createChapterInAct(bookId, name)
        }}
      >
        <Plus size={13} />
      </button>
      <DeleteButton
        onConfirm={async () => {
          await deleteActInBook(bookId, name)
        }}
        label=""
        confirmText={t('pgActDeleteConfirm', { name })}
        className="btn btn-ghost btn-sm"
      />
    </div>
  )
}