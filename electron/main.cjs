const { app, BrowserWindow, shell, dialog, ipcMain } = require('electron')
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
    if (left <= 0) {
      settled = true
      onFail()
      return
    }
    setTimeout(() => waitForServer(port, onOk, onFail, left - 1), 750)
  })
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function pageHtml(title, bodyHtml) {
  return (
    'data:text/html;charset=utf-8,' +
    encodeURIComponent(
      `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title></head>` +
      `<body style="font-family:Segoe UI,Arial,sans-serif;background:#f6f3ec;color:#221e1a;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">` +
      `<div style="max-width:640px;padding:32px;background:#fffdf8;border:1px solid #e6dfd2;border-radius:16px">` +
      bodyHtml +
      `</div></body></html>`
    )
  )
}

function loadingPage() {
  return pageHtml(
    "Writer's Vault",
    `<h2 style="margin:0 0 8px">Writer&#8217;s Vault</h2>
     <p style="color:#6f665c;margin:0">Запуск локального сервера… Обычно это занимает 1–3 секунды.</p>`
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
    `<h2 style="margin:0 0 8px">Не удалось запустить сервер</h2>
     <p style="color:#6f665c">${esc(reason)}</p>
     <p style="color:#6f665c;font-size:13px">Файл лога: ${esc(logFile())}</p>
     <pre style="background:#f1e9db;padding:12px;border-radius:8px;font-size:12px;max-height:260px;overflow:auto">${esc(tailOfLog())}</pre>`
  if (mainWindow) {
    mainWindow.loadURL(pageHtml('Ошибка запуска', body))
  }
}

function setupAutoUpdate() {
  if (!app.isPackaged) return
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
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

app.whenReady().then(async () => {
  logStream = fs.createWriteStream(logFile(), { flags: 'w' })
  log('app ready, version ' + app.getVersion())
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
  startServer(PORT)
  waitForServer(
    PORT,
    () => {
      log('loading app url')
      mainWindow.loadURL(`http://${HOST}:${PORT}/`)
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