# 0 · Prerrequisitos: instalar todo desde cero

> ⏱️ Tiempo estimado: 1 a 2 horas la primera vez. Hacelo **hoy** apenas leas esto.
> Seguí **solo la columna de tu sistema operativo** (Windows o Mac). Si un paso falla, **frená** y mandá una captura del error al grupo.

## ¿Qué vamos a instalar y para qué?

| Programa | Para qué sirve (en criollo) |
|---|---|
| **Cuenta de GitHub** | Donde vive el repositorio del grupo. Tus commits quedan a tu nombre. |
| **Git** | El programa que guarda versiones del código y las sube a GitHub. |
| **Node.js (LTS)** | Ejecuta el proyecto (Next.js) y los tests. Trae `npm` y `npx`. |
| **Go** | Lo pide la cátedra; en Mac hace falta para compilar Active Stack. |
| **GitHub CLI (`gh`)** | Permite que vos (o tu IA) abran Pull Requests desde la terminal. |
| **Visual Studio Code** | Editor para **leer** los archivos que genera la IA (no vas a programar a mano). |
| **Claude Code o Codex** | Tu agente de IA (ya pagaste la cuenta). |
| **Active Stack (modo Full)** | Le instala a tu agente el método: OpenSpec, Engram, Context7, el orquestador SDD y las skills. |
| (Solo Mac) **Homebrew** | Instalador de programas para Mac. Active Stack lo usa para instalar Engram. |

---

## Paso 1 — Cuenta de GitHub

1. Entrá a <https://github.com/signup> y creá tu cuenta (si ya tenés, usá esa).
2. **Verificá tu email** (GitHub te manda un correo).
3. Si GitHub te pide activar **autenticación de dos factores (2FA)**, activala con una app (Google Authenticator, Microsoft Authenticator o similar). Guardá los códigos de recuperación.
4. **Mandale al líder por WhatsApp tu nombre de usuario de GitHub** (ej. `octaviocrescini`). Sin eso no te puede invitar al repositorio.
5. Cuando te llegue el mail **"invited you to collaborate"**, abrilo y tocá **Accept invitation**. También podés aceptarla directo en <https://github.com/franciscode11/turnos-odontologia/invitations> (estando logueado). **La invitación vence a los 7 días.**

---

## Paso 2 — Abrir una terminal

| Windows | Mac |
|---|---|
| Para **instalar** (pasos 3.2 y 4): menú Inicio → escribí **PowerShell** → abrilo. Para **todo lo demás** (desde el paso 3.3 en adelante, y siempre que trabajes en el repo): menú Inicio → **Git Bash** (se instala con Git en el paso 3.2). | `Cmd + Espacio` → escribí **Terminal** → Enter. |

> **Windows:** ¿por qué Git Bash? Porque los comandos de estas guías usan `&&` y otras cosas que la PowerShell que viene con Windows no entiende. En Git Bash funcionan igual que en Mac. Si un comando "no se reconoce", fijate en qué terminal estás.
>
> Cada vez que instales algo nuevo, **cerrá la terminal y abrí una nueva** para que reconozca el programa.

---

## Paso 3 — Instalar los programas

### 3.1 · (Solo Mac) Homebrew

Pegá esto en la Terminal y seguí las instrucciones (te pide tu contraseña de la Mac; al escribirla no se ve nada, es normal):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Al terminar, **copiá y ejecutá las 2 líneas que Homebrew te muestra en "Next steps"** (agregan `brew` al PATH). Comprobá:

```bash
brew --version
```

### 3.2 · Git, Node.js, Go, GitHub CLI y VS Code

| Programa | Windows | Mac |
|---|---|---|
| **Git** | Descargá de <https://git-scm.com/downloads/win> e instalá con **todas las opciones por defecto** (Next, Next…). Esto también instala **Git Bash**. | `brew install git` |
| **Node.js LTS** | Descargá el instalador **LTS** (`.msi`) de <https://nodejs.org/es/download> y dejá todo por defecto. | `brew install node` ← **en Mac instalalo con Homebrew, no con el `.pkg`** (si no, Active Stack falla al instalar OpenSpec). Si ya tenías Node, ejecutá `npm config get prefix`: tiene que decir `/opt/homebrew` (o `/usr/local` en Mac Intel con Homebrew). Si dice otra cosa, avisá al líder antes del paso 5. |
| **Go** | Descargá el `.msi` de <https://go.dev/dl/> e instalá. | `brew install go` |
| **GitHub CLI** | `winget install --id GitHub.cli` (o el instalador de <https://cli.github.com>) | `brew install gh` |
| **VS Code** | <https://code.visualstudio.com/download> | `brew install --cask visual-studio-code` |

Cerrá la terminal, abrí una nueva (**Windows: desde ahora, Git Bash**) y comprobá que todo responde con un número de versión:

```bash
git --version
```

```bash
node -v
```

```bash
npm -v
```

```bash
go version
```

```bash
gh --version
```

✅ Esperado: `git version 2.x`, `node v24.x` o `v26.x`, `npm 1x.x`, `go version go1.26` o más nuevo, `gh version 2.x`.

### 3.3 · Configurar tu identidad de Git (MUY IMPORTANTE)

Si este paso queda mal, **tus commits no cuentan como tuyos en GitHub** y la cátedra no ve tu aporte. Usá **el mismo email que tenés verificado en GitHub**:

```bash
git config --global user.name "Tu Nombre Apellido"
```

```bash
git config --global user.email "el-mismo-email-de-tu-cuenta-github@ejemplo.com"
```

```bash
git config --global init.defaultBranch main
```

Comprobá:

```bash
git config --global --list
```

> ¿No querés que se vea tu email? En GitHub → *Settings → Emails* copiá tu dirección `...@users.noreply.github.com` y usá esa en `user.email`.

### 3.4 · Conectar GitHub CLI con tu cuenta

```bash
gh auth login
```

Respondé: **GitHub.com** → **HTTPS** → **Yes** (autenticar Git con tus credenciales) → **Login with a web browser**. Copiá el código de 8 letras, se abre el navegador, pegalo y autorizá. Comprobá:

```bash
gh auth status
```

✅ Esperado: `✓ Logged in to github.com account TU_USUARIO`.

---

## Paso 4 — Instalar tu agente de IA

Instalá **el que pagaste** (si tenés los dos, podés instalar ambos).

### Opción A · Claude Code

| Windows (PowerShell) | Mac (Terminal) |
|---|---|
| `irm https://claude.ai/install.ps1 \| iex` | `curl -fsSL https://claude.ai/install.sh \| bash` |

Cerrá y abrí la terminal, y ejecutá:

```bash
claude
```

La primera vez te pide iniciar sesión: elegí **tu cuenta de Claude (suscripción Pro/Max)** y autorizá en el navegador. Para salir de Claude Code escribí `/exit`. Comprobá:

```bash
claude --version
```

### Opción B · Codex (OpenAI)

```bash
npm install -g @openai/codex
```

Después ejecutá `codex`, elegí **Sign in with ChatGPT** y autorizá con tu cuenta paga. Comprobá:

```bash
codex --version
```

---

## Paso 5 — Instalar Active Stack en modo **Full**

> 📸 **Evidencia obligatoria:** sacá **una captura de la pantalla final del instalador** (donde se ve la lista de harnesses con ✓). La vas a subir en tu primer PR.

### Windows

1. Descargá **`ActiveStack-Setup.exe`** desde <https://github.com/Group-Active-IA/active-stack/releases/latest/download/ActiveStack-Setup.exe>.
2. Ejecutalo. Si aparece *"Windows protegió su PC"* (SmartScreen): **Más información → Ejecutar de todas formas** (el instalador no está firmado todavía; es el oficial de la cátedra).
3. En el asistente elegí:
   - **Agente:** el que instalaste (Claude Code y/o Codex).
   - **Modo:** **Full**.
   - **Nivel de permisos:** **balanceado**.
4. Esperá a que termine y **sacá la captura** de la pantalla final.

### Mac

Pegá estos comandos **de a uno** en la Terminal:

```bash
cd ~ && git clone https://github.com/Group-Active-IA/active-stack.git
```

```bash
cd ~/active-stack && go build -o active-stack ./cmd/active-stack
```

Ahora un detalle técnico: el instalador intenta usar `sudo` para instalar OpenSpec y en Mac eso falla (lo probamos). Como Node lo instalaste con Homebrew, no hace falta `sudo`. Este comando crea un "sudo de mentira" **solo para esta instalación**:

```bash
mkdir -p ~/.as-shim && printf '#!/bin/sh\nexec "$@"\n' > ~/.as-shim/sudo && chmod +x ~/.as-shim/sudo
```

Ejecutá el instalador (se abre un menú en la terminal; te movés con las flechas y Enter):

```bash
cd ~/active-stack && PATH="$HOME/.as-shim:$PATH" ./active-stack install
```

En el menú elegí: **Agente** = el tuyo (Claude Code y/o Codex) · **Modo** = **Full** · **Permisos** = **balanceado**. Al terminar, **sacá la captura** y borrá el sudo de mentira:

```bash
rm -rf ~/.as-shim
```

### Comprobar la instalación (Windows y Mac)

Cerrá la terminal, abrí una nueva y ejecutá:

```bash
active-stack --version
```

```bash
openspec --version
```

```bash
engram version
```

✅ Esperado: tres números de versión (OpenSpec 2.x, Engram 3.x).

**Si usás Codex:** abrí `codex`, escribí `/hooks` y **aprobá (trust)** el hook de `active-stack`. Codex no lo ejecuta hasta que lo confíes.

**Si usás Claude Code:** abrí `claude` y escribí `/mcp`. Tenés que ver `engram` y `context7` conectados. Salí con `/exit`.

---

## Paso 6 — Clonar el repositorio del grupo

> Hacelo **cuando el líder avise que el repo está creado** y hayas aceptado la invitación.

```bash
cd ~ && mkdir -p Global && cd Global
```

```bash
gh repo clone franciscode11/turnos-odontologia
```

```bash
cd turnos-odontologia && code .
```

(El último comando abre la carpeta en VS Code. En Windows, si `code` no funciona, abrí VS Code → *File → Open Folder* → `Global\turnos-odontologia`.)

### Cuando el líder mergee la base técnica (change C01)

Recién ahí el proyecto tiene código. Ejecutá dentro de la carpeta del repo:

```bash
git checkout main && git pull
```

```bash
npm install
```

```bash
npm test
```

✅ Esperado: todos los tests en verde (`passed`). Para ver la app:

1. El líder te pasa **por privado** el contenido del archivo `.env` (nunca va al repo).
2. Copiá `.env.example` como `.env` y pegá los valores que te pasó.
3. Ejecutá `npm run dev` y abrí <http://localhost:3000>. Entrás con el usuario de prueba que te pase el líder.

---

## Checklist final (marcá todo antes de seguir)

- [ ] Tengo cuenta de GitHub, le pasé mi usuario al líder y acepté la invitación.
- [ ] `git`, `node`, `npm`, `go`, `gh` responden con versión.
- [ ] `git config --global user.email` es **el mismo email** de mi cuenta de GitHub.
- [ ] `gh auth status` dice que estoy logueado.
- [ ] Mi agente (Claude Code o Codex) abre y está logueado con mi cuenta paga.
- [ ] Active Stack Full instalado, **con captura de la pantalla final**.
- [ ] `openspec --version` y `engram version` responden.
- [ ] Cloné el repo y lo abrí en VS Code.

👉 Siguiente: [`02-git-y-prs.md`](02-git-y-prs.md)
