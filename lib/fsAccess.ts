const DB_NAME = 'wv-fs'
const STORE = 'kv'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveDirHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(handle, 'exportDir')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  localStorage.setItem('wv-export-dir-name', handle.name)
}

export async function getSavedDir(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get('exportDir')
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

export async function clearSavedDir(): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete('exportDir')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  localStorage.removeItem('wv-export-dir-name')
}

export function getSavedDirName(): string | null {
  return localStorage.getItem('wv-export-dir-name')
}