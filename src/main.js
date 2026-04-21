const { app, BrowserWindow } = require('electron')
const { authenticate } = require('./auth')
const { startWatcher } = require('./watcher')

let mainWindow

app.whenReady().then(async () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  })

  mainWindow.loadFile('renderer/index.html')

  console.log('Iniciando ClauDrive Agent')

  const { client } = await authenticate()
  console.log('✅ Autenticado!')

  // Iniciar el watcher pasando el cliente autenticado
  startWatcher(client, (status) => {
    // Enviar el status a la ventana
    if (mainWindow) {
      mainWindow.webContents.send('status', status)
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})