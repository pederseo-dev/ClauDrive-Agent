const fs = require('fs')
const path = require('path')

const TOKEN_PATH = path.join(__dirname, '..', 'token.json')

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

module.exports = { saveToken, loadToken }