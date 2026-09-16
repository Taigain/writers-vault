import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const standalone = path.join(root, '.next', 'standalone')

if (!fs.existsSync(standalone)) {
  console.error('Папка .next/standalone не найдена. Сначала выполните next build.')
  process.exit(1)
}

fs.cpSync(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'), { recursive: true })

if (fs.existsSync(path.join(root, 'public'))) {
  fs.cpSync(path.join(root, 'public'), path.join(standalone, 'public'), { recursive: true })
}

fs.cpSync(path.join(root, 'node_modules', '.prisma'), path.join(standalone, 'node_modules', '.prisma'), { recursive: true })
fs.cpSync(path.join(root, 'node_modules', '@prisma', 'client'), path.join(standalone, 'node_modules', '@prisma', 'client'), { recursive: true })

function ensurePackage(name) {
  const parts = name.split('/')
  const dest = path.join(standalone, 'node_modules', ...parts)
  const destPkg = path.join(dest, 'package.json')
  if (fs.existsSync(destPkg)) {
    console.log('пакет ' + name + ' уже в standalone')
    return
  }
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true })
  }
  const src = path.join(root, 'node_modules', ...parts)
  if (!fs.existsSync(src)) {
    console.error('Не найден пакет ' + name + ' в node_modules проекта.')
    process.exit(1)
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.cpSync(src, dest, { recursive: true })
  if (!fs.existsSync(destPkg)) {
    console.error('Копирование пакета ' + name + ' завершилось с ошибкой.')
    process.exit(1)
  }
  console.log('скопирован пакет ' + name + ' в standalone')
}

ensurePackage('next')
ensurePackage('@next/env')

function pruneMaps(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) pruneMaps(p)
    else if (entry.name.endsWith('.map')) fs.rmSync(p)
  }
}
pruneMaps(standalone)

const seed = path.join(root, 'prisma', 'seed.db')
if (!fs.existsSync(seed)) {
  console.error('Не найден prisma/seed.db. Создайте его командой из инструкции.')
  process.exit(1)
}
fs.copyFileSync(seed, path.join(standalone, 'seed.db'))

if (!fs.existsSync(path.join(standalone, 'node_modules', 'next', 'package.json'))) {
  console.error('КОНТРОЛЬНАЯ ТОЧКА НЕ ПРОЙДЕНА: next отсутствует в standalone после подготовки.')
  process.exit(1)
}

console.log('standalone подготовлен к упаковке, контрольная точка next пройдена.')