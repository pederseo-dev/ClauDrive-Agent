const { google } = require('googleapis')
require('dotenv').config()

const CMD_FILE_ID = process.env.CMD_FILE_ID
const CONFIG_FILE_ID = process.env.CONFIG_FILE_ID

function getDriveClient(authClient) {
  return google.drive({ version: 'v3', auth: authClient })
}

// Leer un archivo JSON de Drive
async function readJson(authClient, fileId) {
  const drive = getDriveClient(authClient)
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'json' }
  )
  return res.data
}

// Escribir un archivo JSON en Drive
async function writeJson(authClient, fileId, data) {
  const drive = getDriveClient(authClient)
  await drive.files.update({
    fileId,
    media: {
      mimeType: 'application/json',
      body: JSON.stringify(data, null, 2)
    }
  })
}

// Leer el cmd.json
async function readCmd(authClient) {
  return await readJson(authClient, CMD_FILE_ID)
}

// Escribir el cmd.json
async function writeCmd(authClient, data) {
  return await writeJson(authClient, CMD_FILE_ID, data)
}

// Leer el config.json
async function readConfig(authClient) {
  return await readJson(authClient, CONFIG_FILE_ID)
}

module.exports = { readCmd, writeCmd, readConfig }