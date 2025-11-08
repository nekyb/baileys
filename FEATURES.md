# @soblend/baileys - Guía Completa de Características

## 📚 Índice

1. [Base de Datos Cifrada (BSONLite)](#base-de-datos-cifrada-bsonlite)
2. [Orquestación de Microservicios (MykloreJS)](#orquestación-de-microservicios-myklorejs)
3. [Administración Avanzada de Grupos](#administración-avanzada-de-grupos)
4. [Sistema de Niveles y Puntos](#sistema-de-niveles-y-puntos)
5. [Comandos Integrados](#comandos-integrados)

---

## 🗄️ Base de Datos Cifrada (BSONLite)

### ¿Qué es BSONLite?

BSONLite es una base de datos ligera, cifrada y basada en BSON para Node.js. @soblend/baileys la integra para proporcionar **persistencia segura de datos** sin necesidad de configurar bases de datos externas.

### Características

- ✅ **Cifrado AES**: Protege tus datos con encriptación de nivel empresarial
- ✅ **Formato BSON**: Almacenamiento eficiente y rápido
- ✅ **TypeScript**: API completamente tipada
- ✅ **Backup/Restore**: Sistema de respaldo integrado
- ✅ **Sin dependencias externas**: No necesitas MongoDB, MySQL, etc.

### Uso Básico

```typescript
import { SoblendStorage } from '@soblend/baileys';

const storage = new SoblendStorage(
  './my_bot_data',    // Ruta del archivo
  true,               // Cifrado habilitado
  'MiPassword123!'    // Contraseña de cifrado
);

await storage.initialize();
```

### Gestión de Usuarios

```typescript
await storage.saveUser({
  jid: '1234567890@s.whatsapp.net',
  name: 'Juan Pérez',
  messageCount: 150,
  level: 5,
  points: 550,
  firstSeen: Date.now(),
  lastSeen: Date.now(),
  isBlocked: false,
  isBanned: false,
  metadata: { customData: 'valor' }
});

const user = storage.getUser('1234567890@s.whatsapp.net');

await storage.updateUser(jid, { 
  messageCount: user.messageCount + 1,
  lastSeen: Date.now() 
});

await storage.incrementUserLevel(jid, 10);
```

### Gestión de Chats

```typescript
await storage.saveChat({
  jid: 'chat_id@s.whatsapp.net',
  messages: [],
  lastMessage: msgObj,
  unreadCount: 5,
  isPinned: false,
  isMuted: false
});

await storage.addMessageToChat(jid, messageObject);

const chat = storage.getChat(jid);
```

### Gestión de Grupos

```typescript
await storage.saveGroup({
  jid: 'group_id@g.us',
  name: 'Mi Grupo',
  description: 'Grupo de prueba',
  participants: ['user1@s.whatsapp.net', 'user2@s.whatsapp.net'],
  admins: ['admin@s.whatsapp.net'],
  settings: {
    locked: false,
    announceOnly: false,
    allowMemberAdd: true
  }
});

const group = storage.getGroup('group_id@g.us');
```

### Configuración del Bot

```typescript
const config = storage.getConfig();

await storage.updateConfig({
  botName: 'Mi Bot Personalizado',
  prefix: '.',
  welcomeMessage: '¡Bienvenido {user}!',
  antiLink: true
});

await storage.setConfigValue('autoRead', true);
const autoRead = storage.getConfigValue('autoRead');
```

### Rankings y Estadísticas

```typescript
const topUsers = await storage.getTopUsers(10);
topUsers.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name} - Nivel ${user.level} (${user.points} puntos)`);
});
```

### Backup y Restore

```typescript
await storage.backup('./backup_' + Date.now());

await storage.clearAllData();
```

---

## 🔗 Orquestación de Microservicios (MykloreJS)

### ¿Qué es MykloreJS?

MykloreJS es un orquestador de microservicios que facilita la integración con APIs externas. Incluye patrones de resiliencia como **Circuit Breaker** y **Retry Inteligente**.

### Características

- ✅ **Circuit Breaker**: Previene cascadas de fallos
- ✅ **Retry Automático**: Reintentos con backoff exponencial
- ✅ **Aprendizaje de Patrones**: Optimiza rutas basándose en fallos
- ✅ **Monitoreo**: Seguimiento de llamadas y rendimiento

### Uso Básico

```typescript
import { MicroserviceBridge } from '@soblend/baileys';

const bridge = new MicroserviceBridge();

bridge.registerService({
  name: 'ai-service',
  baseUrl: 'https://api.openai.com',
  endpoints: {
    chat: '/v1/chat/completions',
    images: '/v1/images/generations'
  },
  timeout: 30000
});
```

### Integración con IA

```typescript
const aiResponse = await bridge.processAIMessage(
  '¿Cuál es la capital de Francia?',
  userId
);

if (aiResponse.success) {
  await socket.sendMessage(jid, { 
    text: aiResponse.data 
  });
}
```

### Análisis de Imágenes

```typescript
const imageAnalysis = await bridge.analyzeImage(
  imageBuffer,
  userId
);

console.log('Detección:', imageAnalysis.data);
```

### Traducción de Texto

```typescript
const translated = await bridge.translateText(
  'Hello, how are you?',
  'es'
);

console.log(translated.data);
```

### Moderación de Contenido

```typescript
const moderation = await bridge.moderateContent(
  messageText,
  'text'
);

if (!moderation.data.isSafe) {
  console.log('Contenido inapropiado detectado');
}
```

### Text-to-Speech

```typescript
const audioBuffer = await bridge.generateSpeech(
  'Hola, ¿cómo estás?',
  'es-ES-female'
);

await socket.sendMessage(jid, {
  audio: audioBuffer.data,
  mimetype: 'audio/mp4',
  ptt: true
});
```

### Speech-to-Text

```typescript
const transcription = await bridge.transcribeAudio(audioBuffer);
console.log('Transcripción:', transcription.data);
```

### Análisis de Sentimientos

```typescript
const sentiment = await bridge.analyzesentiment(
  'Me encanta este producto, es increíble!'
);

console.log(`Sentimiento: ${sentiment.data.sentiment}`);
console.log(`Confianza: ${sentiment.data.score}`);
```

### Detectar Idioma

```typescript
const detection = await bridge.detectLanguage(text);
console.log(`Idioma: ${detection.data.language}`);
console.log(`Confianza: ${detection.data.confidence}`);
```

### Generación de Imágenes

```typescript
const imageUrl = await bridge.generateImage(
  'Un gato astronauta en el espacio',
  'digital-art'
);
```

### Búsqueda Web

```typescript
const results = await bridge.searchWeb('Noticias tecnología 2025', 10);
results.data.forEach(result => {
  console.log(result.title, result.url);
});
```

### Clima

```typescript
const weather = await bridge.getWeather('Madrid');
console.log(`Temperatura: ${weather.data.temperature}°C`);
console.log(`Condición: ${weather.data.condition}`);
```

---

## 👥 Administración Avanzada de Grupos

### Crear Grupo

```typescript
import { GroupAdminManager } from '@soblend/baileys';

const groupManager = new GroupAdminManager(socket);

const result = await groupManager.createGroup(
  'Mi Grupo Nuevo',
  ['user1@s.whatsapp.net', 'user2@s.whatsapp.net']
);

if (result.success) {
  console.log('Grupo creado:', result.groupId);
}
```

### Agregar/Remover Participantes

```typescript
await groupManager.addParticipants(groupId, [
  'newuser@s.whatsapp.net'
]);

await groupManager.removeParticipants(groupId, [
  'usertoremove@s.whatsapp.net'
]);
```

### Promover/Degradar Admins

```typescript
await groupManager.promoteParticipants(groupId, [
  'user@s.whatsapp.net'
]);

await groupManager.demoteParticipants(groupId, [
  'admin@s.whatsapp.net'
]);
```

### Actualizar Información del Grupo

```typescript
await groupManager.updateGroupName(groupId, 'Nuevo Nombre');

await groupManager.updateGroupDescription(
  groupId,
  'Esta es la nueva descripción del grupo'
);
```

### Obtener Metadata del Grupo

```typescript
const metadata = await groupManager.getGroupMetadata(groupId);

if (metadata.success) {
  console.log('Nombre:', metadata.data.subject);
  console.log('Participantes:', metadata.data.participants.length);
  console.log('Creado:', new Date(metadata.data.creation * 1000));
}
```

### Códigos de Invitación

```typescript
const inviteCode = await groupManager.getGroupInviteCode(groupId);
console.log(`Código: ${inviteCode}`);

const newCode = await groupManager.revokeGroupInviteCode(groupId);
console.log(`Nuevo código: ${newCode}`);
```

### Configuraciones del Grupo

```typescript
await groupManager.updateGroupSettings(groupId, {
  announceOnly: true,    // Solo admins pueden enviar
  locked: true,          // Solo admins pueden editar info
});
```

### Verificar Permisos

```typescript
const isUserAdmin = await groupManager.isAdmin(groupId, userJid);

const isBotAdmin = await groupManager.isBotAdmin(groupId);

if (!isBotAdmin) {
  console.log('El bot necesita ser admin para esta acción');
}
```

---

## 📊 Sistema de Niveles y Puntos

### Concepto

@soblend/baileys incluye un sistema de gamificación que asigna puntos y niveles a los usuarios basándose en su actividad.

### Configuración

```typescript
socket.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  const sender = msg.key.remoteJid!;
  
  await storage.incrementUserLevel(sender, 5);
});
```

### Cálculo de Niveles

- Cada 100 puntos = 1 nivel
- Puntos se asignan por mensajes, comandos, interacciones, etc.

### Ver Nivel del Usuario

```typescript
const user = storage.getUser(jid);
console.log(`Nivel: ${user.level}`);
console.log(`Puntos: ${user.points}`);
console.log(`Mensajes: ${user.messageCount}`);
```

### Ranking de Usuarios

```typescript
const top10 = await storage.getTopUsers(10);

let leaderboard = '🏆 *Top 10 Usuarios*\n\n';
top10.forEach((user, index) => {
  leaderboard += `${index + 1}. Nivel ${user.level} - ${user.points} pts\n`;
});

await socket.sendMessage(jid, { text: leaderboard });
```

---

## 🤖 Comandos Integrados

### Comandos de Usuario

- `!level` - Ver tu nivel y puntos
- `!top` - Ver ranking de usuarios
- `!help` - Menú de ayuda básico
- `!advhelp` - Menú de ayuda avanzado

### Comandos de Grupos

- `!creategroup <nombre>` - Crear un nuevo grupo
- `!promote @user` - Promover a admin
- `!demote @user` - Quitar admin
- `!groupinfo` - Información del grupo

### Comandos de Sistema

- `!backup` - Crear backup de la base de datos
- `!stats` - Estadísticas del bot
- `!ai <pregunta>` - Consultar IA

### Comandos Interactivos

- `buttons` - Mostrar botones interactivos
- `list` - Mostrar lista interactiva
- `poll` - Crear una encuesta

---

## 🎯 Casos de Uso Completos

### Bot de Comunidad con Niveles

```typescript
const storage = new SoblendStorage('./community_db');
await storage.initialize();

const bot = new SoblendBaileys();
const socket = await bot.connect();

socket.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  const sender = msg.key.remoteJid!;
  
  let user = storage.getUser(sender);
  if (!user) {
    user = {
      jid: sender,
      messageCount: 0,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      isBlocked: false,
      isBanned: false,
      level: 0,
      points: 0
    };
  }
  
  user.messageCount++;
  await storage.saveUser(user);
  await storage.incrementUserLevel(sender, 5);
  
  if (user.level > 0 && user.level % 5 === 0) {
    await socket.sendMessage(sender, {
      text: `🎉 ¡Felicidades! Has alcanzado el nivel ${user.level}!`
    });
  }
});
```

### Bot con IA Integrada

```typescript
const bridge = new MicroserviceBridge();

bridge.registerService({
  name: 'openai',
  baseUrl: 'https://api.openai.com',
  endpoints: { chat: '/v1/chat/completions' }
});

socket.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  const text = msg.message.conversation || '';
  
  if (text.startsWith('!ai ')) {
    const question = text.substring(4);
    const response = await bridge.processAIMessage(question, sender);
    
    if (response.success) {
      await socket.sendMessage(msg.key.remoteJid!, {
        text: `🤖 ${response.data}`
      });
    }
  }
});
```

---

**¡Disfruta de todas las capacidades de @soblend/baileys!** 🚀
