const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('wvBridge', {
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  seenGet: () => ipcRenderer.invoke('wv-seen-get'),
  seenSet: (v) => ipcRenderer.invoke('wv-seen-set', v),
  onUpdateStatus: (cb) => {
    const listener = (_e, status) => cb(status)
    ipcRenderer.on('update:status', listener)
    return () => ipcRenderer.removeListener('update:status', listener)
  },
})