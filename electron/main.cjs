const { app, BrowserWindow, shell, dialog, ipcMain, session, Menu, MenuItem } = require('electron')
const { autoUpdater } = require('electron-updater')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const http = require('http')
const net = require('net')

let forceQuit = false

const HOST = '127.0.0.1'

let serverProcess = null
let mainWindow = null
let PORT = 0
let logStream = null
let settled = false

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

function log(msg) {
  if (!logStream) return
  try {
    logStream.write(`[${new Date().toISOString()}] ${msg}\n`)
  } catch (e) {}
}

function serverDir() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'server')
    : path.join(__dirname, '..', '.next', 'standalone')
}

function dbFile() {
  return path.join(app.getPath('userData'), 'dev.db')
}

function logFile() {
  return path.join(app.getPath('userData'), 'server.log')
}

function prepareDatabase() {
  const target = dbFile()
  if (!fs.existsSync(target)) {
    const seed = path.join(serverDir(), 'seed.db')
    if (fs.existsSync(seed)) {
      fs.copyFileSync(seed, target)
      log('database created from seed.db')
    } else {
      log('WARNING: seed.db not found in ' + serverDir())
    }
  }
}

function pickFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.listen(0, HOST, () => {
      const port = srv.address().port
      srv.close(() => resolve(port))
    })
    srv.on('error', reject)
  })
}

function startServer(port) {
  const dir = serverDir()
  prepareDatabase()
  log('spawning server from ' + dir)
  serverProcess = spawn(process.execPath, [path.join(dir, 'server.js')], {
    cwd: dir,
    env: Object.assign({}, process.env, {
      ELECTRON_RUN_AS_NODE: '1',
      PORT: String(port),
      HOSTNAME: HOST,
      DATABASE_URL: 'file:' + dbFile(),
    }),
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  serverProcess.stdout.on('data', (d) => log('[server] ' + d.toString().trim()))
  serverProcess.stderr.on('data', (d) => log('[server:err] ' + d.toString().trim()))
  serverProcess.on('exit', (code) => {
    log('server process exited with code ' + code)
    if (!settled) {
      settled = true
      showFailure('Внутренний сервер завершился с кодом ' + code)
    }
  })
}

function waitForServer(port, onOk, onFail, tries) {
  const left = tries == null ? 40 : tries
  const req = http.get({ host: HOST, port, path: '/' }, (res) => {
    res.resume()
    log('server responded with status ' + res.statusCode)
    if (!settled) {
      settled = true
      onOk()
    }
  })
  req.setTimeout(1500, () => req.destroy(new Error('poll timeout')))
  req.on('error', () => {
    if (settled) return
    if (left > 0) {
      setTimeout(() => waitForServer(port, onOk, onFail, left - 1), 750)
    } else {
      settled = true
      onFail()
    }
  })
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function pageHtml(title, bodyHtml) {
  return (
    'data:text/html;charset=utf-8,' +
    encodeURIComponent(
      '<!doctype html><html><head><meta charset="utf-8"><title>' +
      esc(title) +
      '</title></head><body style="font-family: system-ui, sans-serif; padding: 40px; background: #f6f3ec; color: #201c17;">' +
      bodyHtml +
      '</body></html>'
    )
  )
}

function loadingPage() {
  return pageHtml(
    "Writer's Vault",
    '<h2>Writer\u2019s Vault</h2><p>Запуск локального сервера… Обычно это занимает 1–3 секунды.</p>'
  )
}

function tailOfLog() {
  try {
    return fs.readFileSync(logFile(), 'utf8').split('\n').slice(-40).join('\n')
  } catch (e) {
    return '(лог недоступен)'
  }
}

function showFailure(reason) {
  log('FAILURE: ' + reason)
  const body =
    '<h2>Не удалось запустить сервер</h2>' +
    '<pre style="white-space: pre-wrap;">' +
    esc(reason) +
    '</pre>' +
    '<p>Файл лога: ' +
    esc(logFile()) +
    '</p>' +
    '<pre style="white-space: pre-wrap;">' +
    esc(tailOfLog()) +
    '</pre>'
  if (mainWindow) {
    mainWindow.loadURL(pageHtml('Ошибка запуска', body))
  }
}

/* ---------- защита автообновления: сброс кэша при смене версии ---------- */
function lastVerFile() {
  return path.join(app.getPath('userData'), 'last-run-version.json')
}

async function guardVersionCache() {
  const cur = app.getVersion()
  let prev = null
  try {
    prev = JSON.parse(fs.readFileSync(lastVerFile(), 'utf8')).v
  } catch (e) {}
  if (prev && prev !== cur) {
    log('version changed ' + prev + ' -> ' + cur + ', clearing renderer cache')
    try {
      await session.defaultSession.clearCache()
    } catch (e) {
      log('clearCache failed: ' + (e && e.message))
    }
  }
  try {
    fs.writeFileSync(lastVerFile(), JSON.stringify({ v: cur }))
  } catch (e) {}
}

/* ---------- окно «Что нового»: просмотренная версия в userData ---------- */
function seenFile() {
  return path.join(app.getPath('userData'), 'seen-version.json')
}

function setupSeenBridge() {
  ipcMain.handle('wv-seen-get', () => {
    try {
      const raw = JSON.parse(fs.readFileSync(seenFile(), 'utf8'))
      return typeof raw.v === 'string' ? raw.v : null
    } catch (e) {
      return null
    }
  })
  ipcMain.handle('wv-seen-set', (_e, v) => {
    try {
      fs.writeFileSync(seenFile(), JSON.stringify({ v: String(v) }))
    } catch (e) {}
    return true
  })
}

/* ---------- автообновление ---------- */
function setupAutoUpdate() {
  if (!app.isPackaged) return
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.disableDifferentialDownload = true
  autoUpdater.on('error', (e) => log('updater error: ' + (e && e.message)))
  autoUpdater.on('update-available', (info) => log('update available: ' + info.version))
  autoUpdater.on('update-available', () => sendUpdateStatus('available'))
  autoUpdater.on('update-not-available', () => sendUpdateStatus('not-available'))
  autoUpdater.on('update-downloaded', () => sendUpdateStatus('downloaded'))
  autoUpdater.on('error', () => sendUpdateStatus('error'))
  autoUpdater.on('update-downloaded', (info) => {
    log('update downloaded: ' + info.version)
    dialog
      .showMessageBox({
        type: 'info',
        title: "Writer's Vault",
        message: 'Обновление готово',
        detail: 'Версия ' + info.version + ' загружена. Перезапустить приложение сейчас?',
        buttons: ['Перезапустить', 'Позже'],
        defaultId: 0,
      })
      .then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall()
      })
  })
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch((e) => log('update check failed: ' + (e && e.message)))
  }, 5000)
}

function sendUpdateStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update:status', status)
  }
}

function setupUpdateBridge() {
  ipcMain.handle('update:check', async () => {
    if (!app.isPackaged) return { ok: false, reason: 'dev' }
    try {
      const res = await autoUpdater.checkForUpdates()
      return { ok: true, version: (res && res.updateInfo && res.updateInfo.version) || null }
    } catch (e) {
      return { ok: false, reason: 'error', message: String((e && e.message) || e) }
    }
  })
}

/* ---------- guard закрытия с несохранённым текстом ---------- */
function setupCloseGuard() {
  if (!mainWindow) return
  mainWindow.on('close', (e) => {
    if (forceQuit) return
    e.preventDefault()
    ;(async () => {
      let dirty = 0
      try {
        dirty = await mainWindow.webContents.executeJavaScript('window.__wvDirtyCount || 0')
      } catch (err) {
        dirty = 0
      }
      if (!dirty) {
        forceQuit = true
        mainWindow.close()
        return
      }
      const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'question',
        title: "Writer's Vault",
        message: 'Несохранённые изменения / Unsaved changes',
        detail:
          'В редакторе есть несохранённый текст. Сохранить перед выходом?\nThere is unsaved text in the editor. Save before exit?',
        buttons: [
          'Сохранить и выйти / Save and exit',
          'Выйти без сохранения / Exit without saving',
          'Отмена / Cancel',
        ],
        defaultId: 0,
        cancelId: 2,
      })
      if (response === 0) {
        try {
          await mainWindow.webContents.executeJavaScript(
            'window.__wvSaveAll ? window.__wvSaveAll() : Promise.resolve()',
          )
        } catch (err) {}
        forceQuit = true
        mainWindow.close()
      } else if (response === 1) {
        forceQuit = true
        mainWindow.close()
      }
    })()
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    backgroundColor: '#f6f3ec',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  mainWindow.loadURL(loadingPage())
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
  mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
    log('did-fail-load: ' + code + ' ' + desc)
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/* ---------- проверка орфографии ---------- */
function customDictPath() {
  return path.join(app.getPath('userData'), 'spell-custom.json')
}
function loadCustomWords() {
  try {
    const arr = JSON.parse(fs.readFileSync(customDictPath(), 'utf8'))
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
function saveCustomWords(words) {
  try {
    fs.writeFileSync(customDictPath(), JSON.stringify(words))
  } catch {
    /* ignore */
  }
}

function setupSpellcheck(win) {
  const ses = win.webContents.session
  try {
    const avail = ses.availableSpellCheckerLanguages || []
    const wanted = ['ru', 'en'].filter((l) => avail.includes(l))
    if (wanted.length > 0) ses.setSpellCheckerLanguages(wanted)
  } catch {
    /* ignore */
  }
  for (const w of loadCustomWords()) {
    try {
      ses.addWordToSpellCheckerDictionary(w)
    } catch {
      /* ignore */
    }
  }
  win.webContents.on('context-menu', (event, params) => {
    const menu = new Menu()
    if (params.misspelledWord) {
      const sugg = params.dictionarySuggestions || []
      if (sugg.length === 0) {
        menu.append(new MenuItem({ label: 'Нет вариантов / No suggestions', enabled: false }))
      } else {
        for (const s of sugg.slice(0, 6)) {
          menu.append(new MenuItem({ label: s, click: () => win.webContents.replaceMisspelling(s) }))
        }
      }
      menu.append(new MenuItem({ type: 'separator' }))
      menu.append(
        new MenuItem({
          label: 'Добавить в словарь / Add to dictionary',
          click: () => {
            try {
              win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
              const words = loadCustomWords()
              if (!words.includes(params.misspelledWord)) {
                words.push(params.misspelledWord)
                saveCustomWords(words)
              }
            } catch {
              /* ignore */
            }
          },
        }),
      )
      menu.append(new MenuItem({ type: 'separator' }))
    }
    if (params.isEditable) {
      menu.append(new MenuItem({ role: 'undo' }))
      menu.append(new MenuItem({ role: 'redo' }))
      menu.append(new MenuItem({ type: 'separator' }))
      menu.append(new MenuItem({ role: 'cut' }))
      menu.append(new MenuItem({ role: 'copy' }))
      menu.append(new MenuItem({ role: 'paste' }))
      menu.append(new MenuItem({ role: 'selectAll' }))
    }
    if (menu.items.length > 0) menu.popup()
  })
}

/* ---------- старт ---------- */
app.whenReady().then(async () => {
  logStream = fs.createWriteStream(logFile(), { flags: 'w' })
  log('app ready, version ' + app.getVersion())
  await guardVersionCache()
  try {
    PORT = await pickFreePort()
    log('picked free port ' + PORT)
  } catch (e) {
    log('port pick failed: ' + e.message)
    PORT = 31111
  }
  createWindow()
  setupCloseGuard()
  setupUpdateBridge()
  setupSeenBridge()
  startServer(PORT)
  waitForServer(
    PORT,
    () => {
      log('loading app url')
      mainWindow.loadURL(`http://${HOST}:${PORT}/`)
      setupSpellcheck(mainWindow)
      setupAutoUpdate()
    },
    () => showFailure('Сервер не ответил за отведённое время.'),
  )
})

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill()
})

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill()
  app.quit()
})