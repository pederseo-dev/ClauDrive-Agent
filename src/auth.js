const { google } = require('googleapis')
const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const SCOPES = ['https://www.googleapis.com/auth/drive']
const TOKEN_PATH = path.join(__dirname, '..', 'token.json')

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

function saveToken(tokens) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
  console.log('💾 Token guardado en token.json')
}

function loadToken() {
  if (fs.existsSync(TOKEN_PATH)) {
    return JSON.parse(fs.readFileSync(TOKEN_PATH))
  }
  return null
}

async function authenticate() {
  const client = createOAuthClient()

  // Si ya hay token guardado, lo usamos directamente
  const savedToken = loadToken()
  if (savedToken) {
    client.setCredentials(savedToken)
    console.log('✅ Sesión restaurada desde token guardado')
    return { client }
  }

  // Si no hay token, pedimos login
  return new Promise((resolve, reject) => {
    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    })

    // Abrimos el navegador con la URL de Google
    const { shell } = require('electron')
    shell.openExternal(authUrl)
    console.log('⏳ Esperando login de Google...')

    // Servidor local para capturar el callback de Google
    const server = http.createServer(async (req, res) => {
      const code = new url.URL(req.url, 'http://localhost').searchParams.get('code')

      if (code) {
        res.end('<html><head><meta charset="UTF-8"></head><body><h2>✅ Conectado! Podés cerrar esta ventana.</h2></body></html>')
        server.close()

        try {
          const { tokens } = await client.getToken(code)
          client.setCredentials(tokens)
          saveToken(tokens)
          console.log('✅ Login exitoso!')
          resolve({ client })
        } catch (err) {
          console.error('❌ Error al obtener token:', err)
          reject(err)
        }
      }
    })

    server.listen(80, () => {
      console.log('🌐 Servidor local escuchando en puerto 80...')
    })

    server.on('error', (err) => {
      console.error('❌ Error en servidor local:', err)
      reject(err)
    })
  })
}

module.exports = { authenticate, createOAuthClient, loadToken }