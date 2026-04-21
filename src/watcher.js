const { exec } = require('child_process')
const { readCmd, writeCmd } = require('./drive')

let polling = null

async function startWatcher(authClient, onStatus) {
  console.log('👀 Watcher iniciado, escuchando cmd.json...')
  onStatus('⏳ Esperando comandos...')

  polling = setInterval(async () => {
    try {
      const cmd = await readCmd(authClient)

      if (cmd.status === 'pending' && cmd.command) {
        console.log(`▶️ Ejecutando: ${cmd.command}`)
        onStatus(`▶️ Ejecutando: ${cmd.command}`)

        // Marcar como ejecutando
        await writeCmd(authClient, { ...cmd, status: 'running', updatedAt: new Date().toISOString() })

        // Ejecutar el comando
        exec(cmd.command, { cwd: cmd.cwd || undefined }, async (error, stdout, stderr) => {
          const output = error ? stderr || error.message : stdout
          const status = error ? 'error' : 'completed'

          console.log(`${status === 'error' ? '❌' : '✅'} Output:`, output)
          onStatus(`${status === 'error' ? '❌' : '✅'} ${output}`)

          // Escribir resultado de vuelta en Drive
          await writeCmd(authClient, {
            ...cmd,
            status,
            output,
            updatedAt: new Date().toISOString()
          })
        })
      }
    } catch (err) {
      console.error('❌ Error en watcher:', err.message)
    }
  }, 3000) // cada 3 segundos
}

function stopWatcher() {
  if (polling) {
    clearInterval(polling)
    polling = null
    console.log('🛑 Watcher detenido')
  }
}

module.exports = { startWatcher, stopWatcher }