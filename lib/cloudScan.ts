import fs from 'fs'
import os from 'os'
import path from 'path'

export type DetectedClient = { provider: string; name: string; rootPath: string }

function isDir(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory()
  } catch {
    return false
  }
}

// Сканирование стандартных расположений клиентов облачных хранилищ.
// Dropbox читается из маркерного info.json (даёт реальный путь синхронизации),
// OneDrive — из переменных окружения и папок профиля, остальные — по именам папок.
export function scanCloudClients(): DetectedClient[] {
  const home = os.homedir()
  const out: DetectedClient[] = []
  const seen = new Set<string>()
  const push = (provider: string, name: string, rootPath: string) => {
    const key = provider + '|' + rootPath.toLowerCase()
    if (seen.has(key) || !isDir(rootPath)) return
    seen.add(key)
    out.push({ provider, name, rootPath })
  }
  push('yandex', 'Yandex Disk', path.join(home, 'YandexDisk'))
  try {
    const info = path.join(
      process.env.APPDATA || path.join(home, 'AppData', 'Roaming'),
      'Dropbox',
      'info.json',
    )
    if (fs.existsSync(info)) {
      const j = JSON.parse(fs.readFileSync(info, 'utf8')) as Record<string, { path?: string }>
      for (const k of Object.keys(j)) {
        const p = j[k]?.path
        if (p) push('dropbox', 'Dropbox', p)
      }
    }
  } catch {
    /* маркер повреждён — остаётся фолбэк ниже */
  }
  push('dropbox', 'Dropbox', path.join(home, 'Dropbox'))
  for (const e of ['OneDrive', 'OneDriveConsumer', 'OneDriveCommercial']) {
    const p = process.env[e]
    if (p) push('onedrive', 'OneDrive', p)
  }
  try {
    for (const d of fs.readdirSync(home)) {
      if (d.startsWith('OneDrive')) push('onedrive', 'OneDrive', path.join(home, d))
    }
  } catch {
    /* профиль не читается — пропускаем */
  }
  push('gdrive', 'Google Drive', path.join(home, 'Google Drive'))
  return out
}