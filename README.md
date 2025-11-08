
<div align="center">

```
   ███████╗ ██████╗ ██████╗ ██╗     ███████╗███╗   ██╗██████╗ 
   ██╔════╝██╔═══██╗██╔══██╗██║     ██╔════╝████╗  ██║██╔══██╗
   ███████╗██║   ██║██████╔╝██║     █████╗  ██╔██╗ ██║██║  ██║
   ╚════██║██║   ██║██╔══██╗██║     ██╔══╝  ██║╚██╗██║██║  ██║
   ███████║╚██████╔╝██████╔╝███████╗███████╗██║ ╚████║██████╔╝
   ╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═══╝╚═════╝ 
                                                               
              🔥 BAILEYS LEGENDARY EDITION 🔥
```

<h3>La Evolución Definitiva de Baileys para WhatsApp</h3>

[![npm version](https://img.shields.io/npm/v/@soblend/baileys.svg?style=for-the-badge&color=success)](https://www.npmjs.com/package/@soblend/baileys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)

<p align="center">
  <strong>🚀 Rendimiento Superior</strong> •
  <strong>🎯 Botones Nativos</strong> •
  <strong>🗄️ Base de Datos Cifrada</strong> •
  <strong>🔗 Microservicios</strong> •
  <strong>👥 Gestión Avanzada</strong>
</p>

---

</div>

## 📑 Tabla de Contenidos

- [✨ ¿Por Qué Soblend Baileys?](#-por-qué-soblend-baileys)
- [🎯 Características Principales](#-características-principales)
- [📦 Instalación](#-instalación)
- [🚀 Inicio Rápido](#-inicio-rápido)
- [💎 Características Premium](#-características-premium)
- [📊 Comparación con Baileys Original](#-comparación-con-baileys-original)
- [🛠️ Tecnologías Integradas](#️-tecnologías-integradas)
- [📖 Documentación](#-documentación)
- [🤝 Contribuir](#-contribuir)
- [📄 Licencia](#-licencia)

---

## ✨ ¿Por Qué Soblend Baileys?

<table>
<tr>
<td width="50%">

### 🎯 **Para Desarrolladores**
- ✅ TypeScript nativo con tipos completos
- ✅ API intuitiva y bien documentada
- ✅ Hot-reload de plugins
- ✅ Debugging avanzado
- ✅ Ejemplos listos para usar

</td>
<td width="50%">

### 🚀 **Para Producción**
- ✅ Auto-reconexión inteligente
- ✅ Sistema de colas y workers
- ✅ Dashboard web en tiempo real
- ✅ Métricas y analytics
- ✅ Escalabilidad horizontal

</td>
</tr>
</table>

---

## 🎯 Características Principales

<div align="center">

### ⚡ **Rendimiento & Estabilidad**

</div>

| Característica | Descripción |
|----------------|-------------|
| 🧠 **Smart Cache** | Sistema de caché inteligente con ML para reducir latencia hasta 80% |
| 🔄 **Auto-Reconnect Pro** | Reconexión automática con estrategia exponencial - nunca pierde conexión |
| ⚙️ **Task Queue** | Procesamiento paralelo con workers para máximo rendimiento |
| 🗜️ **Media Optimizer** | Compresión automática de imágenes/videos con Sharp + FFmpeg |
| 📊 **Real-Time Analytics** | Dashboard web con métricas en vivo y estadísticas avanzadas |

<div align="center">

### 🎨 **Características Interactivas Nativas**

</div>

```typescript
// ✅ Botones Interactivos REALES (no como el Baileys original)
await socket.sendInteractiveButtons(jid, {
  text: '¿Qué te gustaría hacer?',
  footer: '© Powered by Soblend',
  buttons: [
    { buttonId: 'opt1', buttonText: { displayText: '✅ Aceptar' } },
    { buttonId: 'opt2', buttonText: { displayText: '❌ Cancelar' } }
  ]
});

// 📋 Listas Interactivas con Secciones
await socket.sendInteractiveList(jid, {
  text: 'Selecciona una categoría',
  listMessage: {
    title: '📋 Menú Principal',
    buttonText: 'Ver Opciones',
    sections: [
      {
        title: 'Productos',
        rows: [
          { rowId: 'p1', title: 'Producto 1', description: 'Descripción' }
        ]
      }
    ]
  }
});

// 📊 Encuestas hasta 12 opciones
await socket.sendPoll(jid, '¿Tu lenguaje favorito?', [
  'JavaScript', 'Python', 'TypeScript', 'Go', 'Rust'
]);
```

<div align="center">

### 🗄️ **Base de Datos Cifrada (BSONLite)**

</div>

```typescript
import { SoblendStorage } from '@soblend/baileys';

// 🔐 Cifrado AES de nivel empresarial
const storage = new SoblendStorage('./data', true, 'YourPassword123!');
await storage.initialize();

// 👤 Sistema de usuarios con niveles
await storage.saveUser({
  jid: 'user@s.whatsapp.net',
  level: 10,
  points: 1500,
  messageCount: 250
});

// 📈 Rankings automáticos
const topUsers = await storage.getTopUsers(10);

// 💾 Backup automático
await storage.backup('./backup_' + Date.now());
```

<div align="center">

### 🔗 **Orquestación de Microservicios (MykloreJS)**

</div>

```typescript
import { MicroserviceBridge } from '@soblend/baileys';

const bridge = new MicroserviceBridge();

// 🤖 Integración con IA (OpenAI, Claude, etc.)
const aiResponse = await bridge.processAIMessage('Hola', userId);

// 🎙️ Transcripción de audio con Whisper AI
const transcription = await bridge.transcribeAudio(audioBuffer);

// 🌐 Traducción automática
const translated = await bridge.translateText('Hello', 'es');

// 🖼️ Análisis de imágenes con Computer Vision
const analysis = await bridge.analyzeImage(imageBuffer, userId);

// 😊 Análisis de sentimientos
const sentiment = await bridge.analyzeSentiment(text);
```

<div align="center">

### 👥 **Administración Avanzada de Grupos**

</div>

```typescript
import { GroupAdminManager } from '@soblend/baileys';

const groupManager = new GroupAdminManager(socket);

// 🆕 Crear grupos
await groupManager.createGroup('Mi Grupo', [user1, user2]);

// 👑 Gestión de admins
await groupManager.promoteParticipants(groupId, [userId]);
await groupManager.demoteParticipants(groupId, [userId]);

// ⚙️ Configuración avanzada
await groupManager.updateGroupSettings(groupId, {
  announceOnly: true,
  locked: true
});

// 🔗 Códigos de invitación
const code = await groupManager.getGroupInviteCode(groupId);
```

<div align="center">

### 🎮 **Características Exclusivas**

</div>

| 🌟 Característica | 📝 Descripción |
|-------------------|----------------|
| 📸 **Status Capture** | Descarga automática de estados/stories de contactos |
| 🗑️ **Deleted Messages** | Recuperación de mensajes eliminados (anti-delete) |
| 🤖 **Auto-Reply System** | Respuestas automáticas inteligentes con IA |
| 🌐 **Multi-Session** | Soporte para múltiples sesiones simultáneas |
| 📊 **Web Dashboard** | Panel de control web en tiempo real (puerto 3000) |
| 🔌 **Plugin System** | Arquitectura extensible con hot-reload |
| 🛡️ **Anti-Spam ML** | Detección de spam con Machine Learning |

---

## 📦 Instalación

```bash
# NPM
npm install @soblend/baileys

# PNPM
pnpm add @soblend/baileys

# Yarn
yarn add @soblend/baileys
```

### 📋 Requisitos

- Node.js ≥ 18.0.0
- TypeScript ≥ 5.0 (opcional)

---

## 🚀 Inicio Rápido

### 🎯 Ejemplo Básico

```typescript
import { SoblendBaileys } from '@soblend/baileys';

const bot = new SoblendBaileys({
  printQRInTerminal: true,
  enableCache: true,
  enableAntiSpam: true,
});

const socket = await bot.connect('auth_info');

socket.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message || msg.key.fromMe) return;

  const text = msg.message.conversation || '';
  
  // Respuesta simple
  await socket.sendMessage(msg.key.remoteJid!, {
    text: '¡Hola! Soy un bot creado con @soblend/baileys 🚀'
  });
});
```

### 💎 Ejemplo Avanzado con Todas las Características

```typescript
import { 
  SoblendBaileys, 
  SoblendStorage, 
  GroupAdminManager,
  MicroserviceBridge 
} from '@soblend/baileys';

async function main() {
  // 🗄️ Inicializar base de datos cifrada
  const storage = new SoblendStorage('./bot_data', true, 'SecurePass123!');
  await storage.initialize();

  // 🔗 Inicializar microservicios
  const bridge = new MicroserviceBridge();

  // 🤖 Crear bot con todas las características
  const bot = new SoblendBaileys({
    enableCache: true,
    enableAntiSpam: true,
    enableRateLimit: true,
    enableCompression: true,
  });

  const socket = await bot.connect();
  const groupManager = new GroupAdminManager(socket);

  socket.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    const sender = msg.key.remoteJid!;
    const text = msg.message?.conversation || '';

    // 📊 Gestión de usuarios
    let user = storage.getUser(sender);
    if (!user) {
      user = {
        jid: sender,
        messageCount: 0,
        level: 0,
        points: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        isBlocked: false,
        isBanned: false,
      };
    }
    
    user.messageCount++;
    await storage.saveUser(user);
    await storage.incrementUserLevel(sender, 5);

    // 🤖 Comandos con IA
    if (text.startsWith('!ai ')) {
      const question = text.substring(4);
      const response = await bridge.processAIMessage(question, sender);
      
      if (response.success) {
        await socket.sendMessage(sender, { text: `🤖 ${response.data}` });
      }
    }

    // 📊 Ver nivel
    if (text === '!level') {
      await socket.sendMessage(sender, {
        text: `📊 **Tu Progreso**\n\n` +
              `🎯 Nivel: ${user.level}\n` +
              `⭐ Puntos: ${user.points}\n` +
              `💬 Mensajes: ${user.messageCount}`
      });
    }

    // 👥 Crear grupo
    if (text === '!creategroup') {
      const result = await groupManager.createGroup('Mi Grupo', [sender]);
      if (result.success) {
        await socket.sendMessage(sender, {
          text: `✅ Grupo creado: ${result.groupId}`
        });
      }
    }
  });
}

main();
```

---

## 💎 Características Premium

<details>
<summary><b>🗄️ Base de Datos Cifrada</b></summary>

```typescript
// Usuarios
await storage.saveUser({ jid, level: 5, points: 500 });
const user = storage.getUser(jid);

// Chats
await storage.saveChat({ jid, messages: [], unreadCount: 0 });
await storage.addMessageToChat(jid, messageObj);

// Grupos
await storage.saveGroup({ jid, name: 'Grupo', participants: [] });

// Configuración
await storage.updateConfig({ botName: 'MiBot', prefix: '!' });

// Rankings
const topUsers = await storage.getTopUsers(10);

// Backup
await storage.backup('./backup');
```

</details>

<details>
<summary><b>🔗 Microservicios</b></summary>

```typescript
// Registrar servicio
bridge.registerService({
  name: 'ai-service',
  baseUrl: 'https://api.openai.com',
  endpoints: { chat: '/v1/chat/completions' }
});

// IA
const ai = await bridge.processAIMessage(text, userId);

// Traducción
const translated = await bridge.translateText('Hello', 'es');

// TTS
const audio = await bridge.generateSpeech('Hola', 'es-ES-female');

// STT
const transcription = await bridge.transcribeAudio(audioBuffer);

// Visión
const analysis = await bridge.analyzeImage(imageBuffer, userId);

// Sentimientos
const sentiment = await bridge.analyzeSentiment(text);

// Clima
const weather = await bridge.getWeather('Madrid');
```

</details>

<details>
<summary><b>👥 Gestión de Grupos</b></summary>

```typescript
// Crear
await groupManager.createGroup('Nombre', [user1, user2]);

// Participantes
await groupManager.addParticipants(groupId, [newUser]);
await groupManager.removeParticipants(groupId, [user]);

// Admins
await groupManager.promoteParticipants(groupId, [user]);
await groupManager.demoteParticipants(groupId, [admin]);

// Información
await groupManager.updateGroupName(groupId, 'Nuevo Nombre');
await groupManager.updateGroupDescription(groupId, 'Descripción');
const metadata = await groupManager.getGroupMetadata(groupId);

// Invitaciones
const code = await groupManager.getGroupInviteCode(groupId);
await groupManager.revokeGroupInviteCode(groupId);

// Configuración
await groupManager.updateGroupSettings(groupId, {
  announceOnly: true,
  locked: true
});
```

</details>

<details>
<summary><b>🎨 Mensajes Interactivos</b></summary>

```typescript
// Botones
await socket.sendInteractiveButtons(jid, {
  text: '¡Elige!',
  footer: 'Soblend Bot',
  buttons: [
    { buttonId: 'yes', buttonText: { displayText: '✅ Sí' } },
    { buttonId: 'no', buttonText: { displayText: '❌ No' } }
  ]
});

// Listas
await socket.sendInteractiveList(jid, {
  text: 'Menú',
  listMessage: {
    title: '📋 Opciones',
    buttonText: 'Ver',
    sections: [{
      title: 'Categoría',
      rows: [{ rowId: 'opt1', title: 'Opción 1' }]
    }]
  }
});

// Encuestas
await socket.sendPoll(jid, '¿Pregunta?', ['A', 'B', 'C']);
```

</details>

---

## 📊 Comparación con Baileys Original

<div align="center">

| 🎯 Característica | @soblend/baileys | @whiskeysockets/baileys |
|-------------------|:----------------:|:-----------------------:|
| **Botones Interactivos Nativos** | ✅ Totalmente funcionales | ❌ No funcionan |
| **Base de Datos Cifrada** | ✅ BSONLite integrado | ❌ Sin base de datos |
| **Orquestación de Microservicios** | ✅ MykloreJS | ❌ Sin orquestación |
| **Sistema de Niveles/Puntos** | ✅ Gamificación completa | ❌ No disponible |
| **Anti-Spam con ML** | ✅ Machine Learning | ❌ Sin protección |
| **Dashboard Web** | ✅ Tiempo real | ❌ Sin dashboard |
| **Multi-Sesión** | ✅ Soportado | ❌ Solo una sesión |
| **Captura de Estados** | ✅ Automática | ❌ Manual |
| **Recuperar Mensajes Borrados** | ✅ Anti-delete | ❌ Sin recuperación |
| **Auto-Respuestas con IA** | ✅ Integración OpenAI | ❌ Sin IA |
| **Task Queue con Workers** | ✅ Procesamiento paralelo | ❌ Sin workers |
| **Smart Caching** | ✅ ML-powered | ⚠️ Básico |
| **Compresión Media** | ✅ Automática | ❌ Manual |
| **Rate Limiting** | ✅ Avanzado | ❌ Sin límites |
| **Plugin System** | ✅ Hot-reload | ❌ Sin plugins |
| **TypeScript** | ✅ 100% tipado | ⚠️ Parcial |

</div>

---

## 🛠️ Tecnologías Integradas

<table>
<tr>
<td width="50%">

### 🗄️ **BSONLite**
Base de datos ligera y cifrada

- ✅ Cifrado AES-256
- ✅ Formato BSON optimizado
- ✅ API TypeScript-friendly
- ✅ Backup/Restore automático
- ✅ Sin dependencias externas

</td>
<td width="50%">

### 🔗 **MykloreJS**
Orquestador de microservicios

- ✅ Circuit Breaker pattern
- ✅ Retry con backoff exponencial
- ✅ Aprendizaje de patrones
- ✅ Métricas en tiempo real
- ✅ Multi-endpoint support

</td>
</tr>
</table>

---

## 📖 Documentación

<div align="center">

| 📄 Documento | 📝 Descripción |
|--------------|----------------|
| [**README.md**](README.md) | Documentación principal |
| [**USAGE.md**](USAGE.md) | Guía de uso detallada |
| [**FEATURES.md**](FEATURES.md) | Lista completa de características |
| [**PUBLISH.md**](PUBLISH.md) | Guía de publicación en NPM |

</div>

### 🎓 Recursos Adicionales

- 📚 [Ejemplos Completos](src/example.ts)
- 🚀 [Guía de Inicio Rápido](USAGE.md#inicio-rápido)
- 🔧 [Configuración Avanzada](USAGE.md#configuración)
- 🎨 [Botones Interactivos](USAGE.md#botones-interactivos)

---

## ⚙️ Configuración

```typescript
const bot = new SoblendBaileys({
  // 🔗 Conexión
  printQRInTerminal: true,
  autoReconnect: true,
  maxReconnectAttempts: 10,
  reconnectDelay: 3000,
  
  // 🚀 Rendimiento
  enableCache: true,
  cacheExpiry: 300000,
  
  // 🛡️ Seguridad
  enableAntiSpam: true,
  spamThreshold: 5,
  spamTimeWindow: 10000,
  
  // ⚡ Rate Limiting
  enableRateLimit: true,
  rateLimitMax: 30,
  rateLimitWindow: 60000,
  
  // 🗜️ Compresión
  enableCompression: true,
  compressionQuality: 80,
  
  // 🔌 Plugins
  enablePlugins: true,
  
  // 📊 Logging
  logLevel: 'info',
});
```

---

## 🌟 Casos de Uso

<table>
<tr>
<td width="33%">

### 🤖 **Bots de Comunidad**
- Sistema de niveles
- Rankings automáticos
- Estadísticas de usuarios
- Gamificación

</td>
<td width="33%">

### 💼 **Bots Empresariales**
- Atención al cliente
- Auto-respuestas IA
- Multi-sesión
- Dashboard analytics

</td>
<td width="33%">

### 🎓 **Bots Educativos**
- Gestión de grupos
- Recordatorios
- Contenido multimedia
- Encuestas

</td>
</tr>
</table>

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar este proyecto:

1. 🍴 Fork el repositorio
2. 🌿 Crea una rama (`git checkout -b feature/amazing-feature`)
3. 💾 Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. 📤 Push a la rama (`git push origin feature/amazing-feature`)
5. 🎉 Abre un Pull Request

---

## 🐛 Reportar Bugs

Si encuentras un bug, por favor abre un [issue](https://github.com/soblend/baileys/issues) con:

- 📝 Descripción del problema
- 🔧 Pasos para reproducir
- 💻 Versión de Node.js y @soblend/baileys
- 📱 Sistema operativo

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 🌟 Agradecimientos

Este proyecto no sería posible sin:

- [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) - La biblioteca base
- [@imjxsx/bsonlite](https://www.npmjs.com/package/@imjxsx/bsonlite) - Base de datos cifrada
- [MykloreJS](https://www.npmjs.com/package/myklorejs) - Orquestación de microservicios
- Toda la comunidad de desarrolladores que contribuye

---

<div align="center">

### 🚀 ¿Listo para Comenzar?

```bash
npm install @soblend/baileys
```

<p>
  <a href="https://www.npmjs.com/package/@soblend/baileys"><strong>NPM Package</strong></a> •
  <a href="USAGE.md"><strong>Documentation</strong></a> •
  <a href="src/example.ts"><strong>Examples</strong></a>
</p>

---

**Hecho con ❤️ por Soblend**

<sub>La versión más poderosa y completa de Baileys</sub>

[![Star this repo](https://img.shields.io/github/stars/soblend/baileys?style=social)](https://github.com/soblend/baileys)
[![Follow](https://img.shields.io/github/followers/soblend?style=social)](https://github.com/soblend)

</div>
