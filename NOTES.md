# Cloud Code Chat — Guía de Configuración

## 1. Google Cloud Console

### Crear el proyecto
1. Entrar a [console.cloud.google.com](https://console.cloud.google.com)
2. Click en selector de proyectos (arriba a la izquierda) -> Nuevo proyecto
3. Nombre: `cloud-code-chat` -> Crear

### Activar la Drive API
1. Menu izquierdo -> APIs y servicios -> Biblioteca
2. Buscar `Google Drive API`
3. Click en el resultado -> Habilitar

### Configurar pantalla de consentimiento OAuth
1. Menu izquierdo -> APIs y servicios -> Pantalla de consentimiento de OAuth
2. Tipo de usuario: Externo -> Crear
3. Completar:
   - Nombre de la app: `Cloud Code Chat`
   - Correo de asistencia: tu email
   - Correo del desarrollador: tu email
4. Guardar y continuar en todos los pasos (sin agregar scopes ni usuarios)

### Crear credenciales OAuth
1. Menu izquierdo -> APIs y servicios -> Credenciales
2. Click en "+ Crear credenciales" -> "ID de cliente OAuth"
3. Tipo de aplicacion: Aplicacion de escritorio
4. Nombre: `cloud-code-chat-desktop`
5. Click en Crear -> Descargar JSON
6. Renombrar el archivo descargado a `credentials.json`

---

## 2. Estructura del Proyecto

```
cloud-code-chat/
├── .env                <- credenciales (NUNCA subir a GitHub)
├── .gitignore
├── package.json
├── token.json          <- se genera al loguearse (NUNCA subir a GitHub)
├── src/
│   ├── main.js
│   ├── auth.js
│   ├── drive.js
│   └── watcher.js
└── renderer/
    └── index.html
```

---

## 3. Variables de Entorno (.env)

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=http://localhost

# IDs de archivos en Drive
CCC_FOLDER_ID=ID_de_la_carpeta_cloud-code-chat
CMD_FILE_ID=ID_del_cmd.json
CONFIG_FILE_ID=ID_del_config.json
```

### .gitignore
```
.env
token.json
node_modules/
```

---

## 4. Estructura en Google Drive

```
/cloud-code-chat/
├── cmd.json       -> canal de comunicacion entre Claude y la app
└── config.json    -> configuracion de la app
```

### Esquema del cmd.json
```json
{
  "status": "idle | pending | running | completed | error",
  "command": "comando a ejecutar",
  "cwd": "directorio de trabajo",
  "output": "resultado del comando",
  "updatedAt": "2026-04-21T03:00:00Z"
}
```

---

## 5. Dependencias

```bash
npm install electron googleapis dotenv
```

---

## 6. Correr la App

```bash
npm start
```

- Primera vez: abre el navegador para login con Google
- Siguientes veces: restaura la sesion automaticamente desde `token.json`
- En la ventana: `[hora] Esperando comandos...`

---

## 7. Flujo Completo

```
[Claude Chat] -> escribe cmd.json en Drive (status: pending)
      |
[Watcher] -> detecta el cambio cada 3 segundos
      |
[App] -> ejecuta el comando en la PC
      |
[Watcher] -> escribe el output en cmd.json (status: completed)
      |
[Claude Chat] -> lee el resultado
```

---

## 8. Proximos Pasos

- [ ] Claude lee el output de vuelta automaticamente
- [ ] Manejar `cwd` para ejecutar en carpetas especificas
- [ ] Mejorar la UI de la ventana terminal
- [ ] Empaquetar como instalador .exe / .dmg
- [ ] Distribucion publica