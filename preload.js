const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 本地程序调用相关
  openLocalApp: (appName) => ipcRenderer.send('open-local-app', appName),
  onAppOpenSuccess: (callback) => ipcRenderer.on('app-open-success', (event, appName) => callback(appName)),
  onAppOpenFail: (callback) => ipcRenderer.on('app-open-fail', (event, errorMsg) => callback(errorMsg)),

  // ========== 新增：聊天记录相关 API ==========
  saveChatRecord: (records) => ipcRenderer.send('save-chat-record', records),
  loadChatRecord: () => ipcRenderer.send('load-chat-record'),
  onLoadRecordSuccess: (callback) => ipcRenderer.on('load-record-success', (event, records) => callback(records)),
  onLoadRecordFail: (callback) => ipcRenderer.on('load-record-fail', (event, errorMsg) => callback(errorMsg)),
  onSaveRecordSuccess: (callback) => ipcRenderer.on('save-record-success', callback),
  onSaveRecordFail: (callback) => ipcRenderer.on('save-record-fail', (event, errorMsg) => callback(errorMsg))
});