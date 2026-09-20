type EditorEntry = { dirty: boolean; save: () => Promise<void> }
const reg = new Map<string, EditorEntry>()

function publish() {
  if (typeof window === 'undefined') return
  const w = window as unknown as { __wvDirtyCount?: number; __wvSaveAll?: () => Promise<void> }
  w.__wvDirtyCount = [...reg.values()].filter((e) => e.dirty).length
  w.__wvSaveAll = async () => {
    for (const e of [...reg.values()]) {
      if (e.dirty) await e.save()
    }
  }
}

export function registerEditor(id: string, save: () => Promise<void>) {
  reg.set(id, { dirty: false, save })
  publish()
}

export function setEditorDirty(id: string, dirty: boolean) {
  const e = reg.get(id)
  if (!e) return
  e.dirty = dirty
  publish()
}

export function unregisterEditor(id: string) {
  reg.delete(id)
  publish()
}

function dirtyCount() {
  return [...reg.values()].filter((e) => e.dirty).length
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', (e) => {
    if (dirtyCount() > 0) {
      e.preventDefault()
      e.returnValue = ''
    }
  })
}