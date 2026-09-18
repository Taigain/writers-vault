import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const src = path.join(root, '.next', 'standalone')
const dest = path.join(root, 'dist', 'win-unpacked', 'resources', 'server')

if (!fs.existsSync(path.join(src, 'node_modules', 'next', 'package.json'))) {
  console.error('standalone не содержит next. Выполните prepare-dist.mjs.')
  process.exit(1)
}

fs.rmSync(dest, { recursive: true, force: true })
fs.mkdirSync(dest, { recursive: true })
fs.cpSync(src, dest, { recursive: true })

if (!fs.existsSync(path.join(dest, 'node_modules', 'next', 'package.json'))) {
  console.error('Инъекция сервера не удалась: next не найден в win-unpacked.')
  process.exit(1)
}

console.log('Сервер инжектирован в dist/win-unpacked/resources/server')

// --- гарантия app-update.yml в ресурсах (канал автообновления) ---
import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ymlPath = resolve('dist/win-unpacked/resources/app-update.yml')
if (!existsSync(ymlPath)) {
  writeFileSync(
    ymlPath,
    'provider: github\nowner: Taigain\nrepo: writers-vault\nupdaterCacheDirName: writer-app-updater\n',
    'utf8',
  )
  console.log('[inject] app-update.yml created')
} else {
  console.log('[inject] app-update.yml present')
}