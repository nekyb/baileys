# Guía de Uso - @soblend/baileys

## Tabla de Contenidos

1. [Instalación y Configuración Inicial](#instalación-y-configuración-inicial)
2. [Conexión Básica](#conexión-básica)
3. [Envío de Mensajes](#envío-de-mensajes)
4. [Botones Interactivos](#botones-interactivos)
5. [Listas Interactivas](#listas-interactivas)
6. [Encuestas](#encuestas)
7. [Sistema de Administración](#sistema-de-administración)
8. [Plugins](#plugins)
9. [Optimización de Media](#optimización-de-media)
10. [Mejores Prácticas](#mejores-prácticas)

## Instalación y Configuración Inicial

### Instalación

```bash
npm install @soblend/baileys
```

### Configuración Básica

```typescript
import { SoblendBaileys } from '@soblend/baileys';

const bot = new SoblendBaileys({
  printQRInTerminal: true,
  enableCache: true,
  enableAntiSpam: true,
  enableRateLimit: true,
  logLevel: 'info',
});
```

## Conexión Básica

### Conexión Simple

```typescript
const socket = await bot.connect('auth_info');

socket.ev.on('connection.update', (update) => {
  const { connection } = update;
  if (connection === 'open') {
    console.log('Conectado a WhatsApp!');
  }
});
```

### Con Manejo de Errores

```typescript
try {
  const socket = await bot.connect('auth_info');
  console.log('Conexión exitosa!');
} catch (error) {
  console.error('Error al conectar:', error);
  process.exit(1);
}
```

## Envío de Mensajes

### Mensaje de Texto Simple

```typescript
await socket.sendMessage(jid, {
  text: 'Hola, este es un mensaje de prueba!'
});
```

### Mensaje con Formato

```typescript
await socket.sendMessage(jid, {
  text: '*Negrita* _Cursiva_ ~Tachado~ ```Código```'
});
```

### Mensaje con Imagen

```typescript
await socket.sendMessage(jid, {
  image: { url: './imagen.jpg' },
  caption: 'Esta es mi imagen'
});
```

### Mensaje con Video

```typescript
await socket.sendMessage(jid, {
  video: { url: './video.mp4' },
  caption: 'Mira este video'
});
```

### Mensaje con Audio

```typescript
await socket.sendMessage(jid, {
  audio: { url: './audio.mp3' },
  mimetype: 'audio/mp4',
  ptt: true
});
```

## Botones Interactivos

### Botones Básicos

```typescript
await socket.sendInteractiveButtons(jid, {
  text: '¡Selecciona una opción!',
  footer: 'Powered by @soblend/baileys',
  buttons: [
    {
      buttonId: 'btn_1',
      buttonText: { displayText: '✅ Aceptar' },
      type: 1,
    },
    {
      buttonId: 'btn_2',
      buttonText: { displayText: '❌ Rechazar' },
      type: 1,
    },
  ],
});
```

### Botones con Imagen

```typescript
await socket.sendInteractiveButtons(jid, {
  text: 'Productos disponibles',
  footer: 'Elige tu favorito',
  image: './producto.jpg',
  buttons: [
    {
      buttonId: 'buy',
      buttonText: { displayText: '🛒 Comprar' },
      type: 1,
    },
    {
      buttonId: 'info',
      buttonText: { displayText: 'ℹ️ Más Info' },
      type: 1,
    },
  ],
});
```

### Responder a Botones

```typescript
socket.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  
  const buttonResponse = msg.message?.buttonsResponseMessage;
  if (buttonResponse) {
    const buttonId = buttonResponse.selectedButtonId;
    
    if (buttonId === 'btn_1') {
      await socket.sendMessage(msg.key.remoteJid!, {
        text: 'Has seleccionado: Aceptar ✅'
      });
    }
  }
});
```

## Listas Interactivas

### Lista Simple

```typescript
await socket.sendInteractiveList(jid, {
  text: 'Elige del menú',
  footer: 'Powered by @soblend/baileys',
  listMessage: {
    title: '📋 Menú',
    buttonText: 'Ver Opciones',
    sections: [
      {
        title: 'Opciones Disponibles',
        rows: [
          {
            rowId: 'opt1',
            title: 'Opción 1',
            description: 'Descripción de la primera opción'
          },
          {
            rowId: 'opt2',
            title: 'Opción 2',
            description: 'Descripción de la segunda opción'
          },
        ],
      },
    ],
  },
});
```

### Lista con Múltiples Secciones

```typescript
await socket.sendInteractiveList(jid, {
  text: 'Selecciona un producto',
  listMessage: {
    title: '🛍️ Catálogo',
    buttonText: 'Ver Productos',
    sections: [
      {
        title: 'Electrónica',
        rows: [
          {
            rowId: 'laptop',
            title: 'Laptop',
            description: '$999 - Alta gama'
          },
          {
            rowId: 'phone',
            title: 'Smartphone',
            description: '$699 - Última generación'
          },
        ],
      },
      {
        title: 'Accesorios',
        rows: [
          {
            rowId: 'case',
            title: 'Funda',
            description: '$29 - Protección premium'
          },
        ],
      },
    ],
  },
});
```

### Responder a Listas

```typescript
socket.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  
  const listResponse = msg.message?.listResponseMessage;
  if (listResponse) {
    const selectedId = listResponse.singleSelectReply?.selectedRowId;
    
    await socket.sendMessage(msg.key.remoteJid!, {
      text: `Has seleccionado: ${selectedId}`
    });
  }
});
```

## Encuestas

### Encuesta Simple

```typescript
await socket.sendPoll(jid, '¿Te gusta @soblend/baileys?', [
  'Sí, es increíble',
  'No, prefiero el original'
]);
```

### Encuesta con Múltiples Opciones

```typescript
await socket.sendPoll(
  jid,
  '¿Cuál es tu lenguaje de programación favorito?',
  [
    'JavaScript',
    'Python',
    'TypeScript',
    'Java',
    'Go',
    'Rust',
    'C++',
    'PHP'
  ]
);
```

## Sistema de Administración

### Obtener Estadísticas

```typescript
const stats = socket.getAdminStats();

console.log('Mensajes procesados:', stats.messageCount);
console.log('Spam bloqueado:', stats.blockedSpam);
console.log('Rate limit hits:', stats.rateLimitHits);
console.log('Uptime:', stats.uptime);
console.log('Cache hits:', stats.cacheHits);
console.log('Cache misses:', stats.cacheMisses);
```

### Configurar Anti-Spam

```typescript
socket.enableAntiSpam(true);
```

### Configurar Rate Limiting

```typescript
socket.setRateLimit(50, 60000);
```

### Monitoreo en Tiempo Real

```typescript
setInterval(() => {
  const stats = socket.getAdminStats();
  const uptime = Math.floor(stats.uptime / 1000);
  
  console.log(`
    📊 Estadísticas:
    - Mensajes: ${stats.messageCount}
    - Spam bloqueado: ${stats.blockedSpam}
    - Uptime: ${uptime}s
    - Cache hit rate: ${(stats.cacheHits / (stats.cacheHits + stats.cacheMisses) * 100).toFixed(2)}%
  `);
}, 60000);
```

## Plugins

### Crear un Plugin

```typescript
import { Plugin, SoblendSocket } from '@soblend/baileys';

const commandPlugin: Plugin = {
  name: 'CommandPlugin',
  version: '1.0.0',
  
  init: async (socket: SoblendSocket) => {
    console.log('Command plugin initialized!');
  },
  
  onMessage: async (msg) => {
    const text = msg.message?.conversation || '';
    
    if (text.startsWith('!')) {
      const [command, ...args] = text.slice(1).split(' ');
      console.log(`Command: ${command}, Args:`, args);
    }
  },
};
```

### Registrar Plugin

```typescript
const bot = new SoblendBaileys();
const socket = await bot.connect();

bot.getPluginManager().registerPlugin(commandPlugin);
```

### Plugin Completo con Comandos

```typescript
const advancedPlugin: Plugin = {
  name: 'AdvancedPlugin',
  version: '1.0.0',
  
  init: async (socket: SoblendSocket) => {
    console.log('Advanced plugin loaded!');
  },
  
  onMessage: async (msg) => {
    const text = msg.message?.conversation || '';
    const jid = msg.key.remoteJid!;
    
    if (text === '!ping') {
      await socket.sendMessage(jid, { text: 'Pong! 🏓' });
    }
    
    if (text === '!stats') {
      const stats = socket.getAdminStats();
      await socket.sendMessage(jid, {
        text: `📊 Stats:\nMensajes: ${stats.messageCount}\nUptime: ${Math.floor(stats.uptime / 1000)}s`
      });
    }
  },
};
```

## Optimización de Media

### Comprimir Imagen

```typescript
const bot = new SoblendBaileys();
const compressor = bot.getCompressor();

const compressed = await compressor.compressImage('./imagen.jpg', {
  maxWidth: 1920,
  maxHeight: 1080,
  format: 'jpeg'
});

await socket.sendMessage(jid, {
  image: compressed,
  caption: 'Imagen optimizada'
});
```

### Generar Thumbnail

```typescript
const thumbnail = await compressor.generateThumbnail('./imagen.jpg', 200);
```

## Mejores Prácticas

### 1. Manejo de Errores

```typescript
socket.ev.on('messages.upsert', async ({ messages }) => {
  try {
    const msg = messages[0];
    
  } catch (error) {
    console.error('Error procesando mensaje:', error);
  }
});
```

### 2. Validación de Mensajes

```typescript
socket.ev.on('messages.upsert', async ({ messages }) => {
  for (const msg of messages) {
    if (!msg.message || msg.key.fromMe) continue;
    
  }
});
```

### 3. Rate Limiting Manual

```typescript
const messageQueue = new Map();

socket.ev.on('messages.upsert', async ({ messages }) => {
  for (const msg of messages) {
    const sender = msg.key.remoteJid!;
    
    if (!messageQueue.has(sender)) {
      messageQueue.set(sender, []);
    }
    
    const queue = messageQueue.get(sender);
    queue.push(msg);
    
    if (queue.length > 5) {
      console.log('Usuario excedió límite de mensajes');
      continue;
    }
  }
});
```

### 4. Logging Estructurado

```typescript
const bot = new SoblendBaileys({
  logLevel: 'debug',
});

socket.ev.on('messages.upsert', ({ messages }) => {
  console.log(`[${new Date().toISOString()}] Nuevo mensaje recibido`);
});
```

### 5. Persistencia de Datos

```typescript
import fs from 'fs';

const saveData = (key: string, data: any) => {
  fs.writeFileSync(`./data/${key}.json`, JSON.stringify(data, null, 2));
};

const loadData = (key: string) => {
  try {
    return JSON.parse(fs.readFileSync(`./data/${key}.json`, 'utf-8'));
  } catch {
    return null;
  }
};
```

---

Para más información, consulta el README.md principal.
