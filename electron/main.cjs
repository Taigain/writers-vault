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
  const left = tries == null ? 160 : tries
  const req = http.get({ host: HOST, port, path: '/' }, (res) => {
    res.resume()
    log('server responded with status ' + res.statusCode)
    if (!settled) {
      settled = true
      onOk()
    }
  })
  req.setTimeout(2500, () => req.destroy(new Error('poll timeout')))
  req.on('error', () => {
    if (settled) return
    if (left > 0) {
      if (left % 20 === 0) log('still waiting for server, tries left: ' + left)
      setTimeout(() => waitForServer(port, onOk, onFail, left - 1), 700)
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

function loadingPage(logPath) {
  const log = typeof logPath === 'string' ? logPath : ''
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<style>
  html,body{height:100%;margin:0;background:#f6f3ec;font-family:Georgia,'Times New Roman',serif;color:#201c17;-webkit-user-select:none;user-select:none;overflow:hidden}
  .wrap{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
  .logo{width:76px;height:76px;border-radius:50%;background:#211d19;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 22px rgba(32,28,23,.28);animation:pop .55s cubic-bezier(.2,1.4,.4,1) both}
  .logo svg{width:42px;height:42px}
  @keyframes pop{from{transform:scale(.55);opacity:0}to{transform:scale(1);opacity:1}}
  .name{font-size:30px;font-style:italic;letter-spacing:.4px;min-height:40px}
  .caret{display:inline-block;width:2px;height:26px;background:#8c3a2b;vertical-align:-3px;margin-left:3px;animation:blink 1s steps(1) infinite}
  @keyframes blink{50%{opacity:0}}
  .ink{width:230px;height:26px;margin-top:-6px}
  .ink path{fill:none;stroke:#8c3a2b;stroke-width:2;stroke-linecap:round;stroke-dasharray:260;stroke-dashoffset:260;animation:draw 2.1s ease .55s forwards;opacity:.85}
  @keyframes draw{to{stroke-dashoffset:0}}
  .status{font-size:13px;color:#6b6257;font-family:'Segoe UI',Arial,sans-serif}
  .dots span{animation:dot 1.2s infinite}
  .dots span:nth-child(2){animation-delay:.2s}
  .dots span:nth-child(3){animation-delay:.4s}
  @keyframes dot{0%,60%,100%{opacity:.2}30%{opacity:1}}
  .log{position:fixed;bottom:10px;left:0;right:0;text-align:center;font-size:11px;color:#9a9184;font-family:Consolas,monospace}
  @media (prefers-reduced-motion: reduce){
    *{animation:none !important}
    .ink path{stroke-dashoffset:0}
    .caret{opacity:1}
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 4c-3.2 0-8.2 2.1-11.2 6.1C6.7 12.8 5.8 16.2 5.8 19c2.8 0 6.2-.7 8.9-2.7C18.2 13.5 20 8.2 20 4Z" fill="#f5f0e8"/>
      <path d="M6.2 18.8 4.4 20.6" stroke="#f5f0e8" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  </div>
  <div class="name" data-full="Writer&#8217;s Vault"><span id="t"></span><span class="caret"></span></div>
  <svg class="ink" viewBox="0 0 230 26" aria-hidden="true">
    <path d="M4 16 C 30 6, 54 22, 80 12 S 132 4, 158 14 S 206 20, 226 8"/>
  </svg>
  <div class="status">Запуск локального сервера<span class="dots"><span>.</span><span>.</span><span>.</span></span></div>
  <div class="status" style="opacity:.75">Обычно это занимает 1–3 секунды.</div>
</div>
<div class="log">${log}</div>
<script>
  var host = document.querySelector('.name');
  var full = host.getAttribute('data-full') || '';
  var el = document.getElementById('t');
  var i = 0;
  var iv = setInterval(function () {
    i += 1;
    el.textContent = full.slice(0, i);
    if (i >= full.length) clearInterval(iv);
  }, 85);
</script>
</body>
</html>`
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