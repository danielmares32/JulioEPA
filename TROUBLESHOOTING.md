# 🔧 Solución de Problemas - Aula Virtual 2.0

## ⚡ Problemas Comunes

### 1. **Error con better-sqlite3**
```
Error: The module 'better_sqlite3.node' was compiled against a different Node.js version
```

**Solución:**
```bash
npm run rebuild
# o
npx electron-rebuild
```

### 2. **Error "Cannot find module"**
```
Cannot find module 'dist/main/index.js'
```

**Solución:**
```bash
npm run build:main
```

### 3. **Puerto 3000 ocupado**
```
Error: Port 3000 is already in use
```

**Solución:**
```bash
# Matar proceso que usa puerto 3000
lsof -ti:3000 | xargs kill -9
# o cambiar puerto en vite.config.ts
```

### 4. **Electron no inicia**
**Verificar:**
```bash
# 1. Dependencias instaladas
npm install

# 2. Build completado
npm run build

# 3. Electron instalado globalmente (opcional)
npm install -g electron
```

## 🚀 Scripts de Solución Rápida

### Reinicio Completo
```bash
rm -rf node_modules dist
npm install
npm run build
npm run demo
```

### Solo Reconstruir Nativo
```bash
npm run rebuild
npm run build:main
npm run demo
```

### Desarrollo Manual
```bash
# Terminal 1
npm run dev:renderer

# Terminal 2 (esperar a que inicie el servidor)
npm run electron
```

## 📦 Verificación de Instalación

```bash
# Verificar versiones
node --version    # >= 18.0.0
npm --version     # >= 9.0.0
electron --version # >= 28.0.0

# Verificar estructura
ls -la dist/
# Debe contener: main/ y renderer/

# Verificar dependencias críticas
npm list electron
npm list react
npm list typescript
```

## 🔍 Debugging

### Activar DevTools
```javascript
// En src/main/index.ts
mainWindow.webContents.openDevTools();
```

### Logs de Electron
```bash
# Linux/macOS
DEBUG=* npm run electron

# Windows
set DEBUG=* && npm run electron
```

### Logs del Renderer
- Abrir DevTools (F12)
- Console tab
- Network tab para verificar recursos

## 🌐 Problemas de Red

### Timeout en npm install
```bash
npm config set registry https://registry.npmjs.org/
npm install --network-timeout 100000
```

### Proxy corporativo
```bash
npm config set proxy http://proxy.empresa.com:8080
npm config set https-proxy http://proxy.empresa.com:8080
```

## 💻 Problemas por Plataforma

### macOS
```bash
# Permisos de ejecución
chmod +x demo.js

# Xcode Command Line Tools
xcode-select --install
```

### Windows
```bash
# PowerShell como administrador
npm install --global windows-build-tools

# O instalar Visual Studio Build Tools
```

### Linux
```bash
# Dependencias de desarrollo
sudo apt-get install build-essential libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2

# O en CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install nss atk at-spi2-atk libdrm libxkbcommon libXcomposite libXdamage libXrandr libgbm libXss alsa-lib
```

## 🚨 Errores Críticos

### "Electron app failed to load"
1. Verificar que el renderer esté construido
2. Verificar rutas en main/index.ts
3. Verificar permisos de archivos

### "White screen" en producción
1. Verificar base path en vite.config.ts
2. Verificar CSP headers
3. Verificar rutas relativas vs absolutas

### "App crashes on startup"
1. Verificar logs en terminal
2. Remover userData: `rm -rf ~/Library/Application\ Support/aula-virtual-desktop`
3. Verificar dependencias nativas

## 📞 Contacto Soporte

Si los problemas persisten:

1. **Crear Issue**: [GitHub Issues](https://github.com/uaa/aula-virtual-desktop/issues)
2. **Email**: soporte.tecnico@uaa.mx
3. **Incluir**:
   - OS y versión
   - Versión de Node.js
   - Logs completos del error
   - Pasos para reproducir

## ✅ Lista de Verificación

Antes de reportar un problema:

- [ ] `npm install` ejecutado exitosamente
- [ ] `npm run build` sin errores
- [ ] Puerto 3000 disponible
- [ ] Permisos de ejecución correctos
- [ ] Antivirus no bloqueando archivos
- [ ] Espacio en disco suficiente (>500MB)
- [ ] Conexión a internet para dependencias

---

*Última actualización: Enero 2025*