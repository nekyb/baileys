
import { SoblendBaileys } from '../core/connection';
import { AdvancedGroupAdminManager } from './manager';

async function setupAdvancedGroupManagement() {
  // Conectar el bot
  const soblend = new SoblendBaileys({
    printQRInTerminal: true,
    enableCache: true,
    logLevel: 'info',
  });

  const socket = await soblend.connect('auth_info');
  const groupManager = new AdvancedGroupAdminManager(socket);

  console.log('✅ Sistema de administración avanzado iniciado\n');

  // ============================================
  // CONFIGURAR MENSAJES DE BIENVENIDA
  // ============================================
  
  groupManager.setWelcomeMessage('GRUPO_ID@g.us', {
    enabled: true,
    text: '👋 ¡Bienvenido {user} a {group}!\n\nPor favor lee las reglas del grupo.',
    buttons: true
  });

  groupManager.setGoodbyeMessage('GRUPO_ID@g.us', {
    enabled: true,
    text: '👋 Adiós {user}, esperamos verte pronto.'
  });

  // ============================================
  // CONFIGURAR REGLAS AUTOMÁTICAS
  // ============================================
  
  // Anti-link
  groupManager.addRule('GRUPO_ID@g.us', {
    id: 'no-links',
    type: 'anti-link',
    enabled: true,
    action: 'warn',
    message: 'No se permiten enlaces en este grupo.'
  });

  // Anti-spam
  groupManager.addRule('GRUPO_ID@g.us', {
    id: 'no-spam',
    type: 'anti-spam',
    enabled: true,
    action: 'mute',
    message: 'Detectado comportamiento de spam.'
  });

  // Palabras prohibidas
  groupManager.addRule('GRUPO_ID@g.us', {
    id: 'bad-words',
    type: 'anti-bad-words',
    enabled: true,
    action: 'warn',
    patterns: [/palabra1/i, /palabra2/i],
    message: 'Por favor mantén un lenguaje respetuoso.'
  });

  // ============================================
  // REGISTRAR EVENTOS
  // ============================================
  
  groupManager.registerEventListener('GRUPO_ID@g.us', {
    onMemberJoin: async (groupId, members) => {
      console.log(`✅ ${members.length} nuevo(s) miembro(s) en ${groupId}`);
    },
    
    onMemberLeave: async (groupId, members) => {
      console.log(`❌ ${members.length} miembro(s) salió/salieron de ${groupId}`);
    },
    
    onMemberPromote: async (groupId, members) => {
      console.log(`👑 ${members.length} nuevo(s) admin(s) en ${groupId}`);
      await socket.sendMessage(groupId, {
        text: `¡Felicidades! Los siguientes usuarios ahora son administradores:\n${members.map(m => `- @${m.split('@')[0]}`).join('\n')}`,
        mentions: members
      });
    },
    
    onMemberDemote: async (groupId, members) => {
      console.log(`👤 ${members.length} admin(s) degradado(s) en ${groupId}`);
    },
    
    onGroupNameChange: async (groupId, oldName, newName) => {
      console.log(`📝 Nombre cambiado en ${groupId}: "${oldName}" -> "${newName}"`);
    },
    
    onGroupDescriptionChange: async (groupId, newDesc) => {
      console.log(`📄 Descripción actualizada en ${groupId}`);
    }
  });

  // ============================================
  // ESCUCHAR MENSAJES Y COMANDOS
  // ============================================
  
  socket.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const groupId = msg.key.remoteJid;
      const userId = msg.key.participant || msg.key.remoteJid;
      const text = msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || '';

      // Solo procesar mensajes de grupo
      if (!groupId?.endsWith('@g.us')) continue;

      // Verificar si el usuario está silenciado
      if (groupManager.isUserMuted(groupId, userId!)) {
        console.log(`🔇 Mensaje bloqueado de usuario silenciado: ${userId}`);
        // Eliminar mensaje (requiere ser admin)
        const isBotAdmin = await groupManager.isBotAdmin(groupId);
        if (isBotAdmin) {
          await socket.sendMessage(groupId, {
            delete: msg.key
          });
        }
        continue;
      }

      // Verificar reglas
      const passed = await groupManager.checkRules(groupId, userId!, text);
      if (!passed) {
        // Eliminar mensaje si viola reglas
        const isBotAdmin = await groupManager.isBotAdmin(groupId);
        if (isBotAdmin) {
          await socket.sendMessage(groupId, {
            delete: msg.key
          });
        }
        continue;
      }

      // Comandos administrativos
      if (text.startsWith('!')) {
        const [command, ...args] = text.slice(1).toLowerCase().split(' ');
        const isAdmin = await groupManager.isAdmin(groupId, userId!);

        switch (command) {
          case 'panel':
          case 'admin':
            await groupManager.sendAdminPanel(groupId, userId!);
            break;

          case 'add':
            if (!isAdmin) {
              await socket.sendMessage(groupId, {
                text: '❌ Solo admins pueden usar este comando.'
              });
              break;
            }
            if (args.length === 0) {
              await socket.sendMessage(groupId, {
                text: '❌ Uso: !add @usuario1 @usuario2'
              });
              break;
            }
            // Extraer JIDs de las menciones
            const toAdd = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (toAdd.length > 0) {
              const results = await groupManager.addParticipants(groupId, toAdd);
              const success = results.filter(r => r.success).length;
              await socket.sendMessage(groupId, {
                text: `✅ ${success}/${toAdd.length} usuarios agregados.`
              });
            }
            break;

          case 'kick':
          case 'remove':
            if (!isAdmin) {
              await socket.sendMessage(groupId, {
                text: '❌ Solo admins pueden usar este comando.'
              });
              break;
            }
            const toRemove = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (toRemove.length > 0) {
              const results = await groupManager.removeParticipants(groupId, toRemove);
              const success = results.filter(r => r.success).length;
              await socket.sendMessage(groupId, {
                text: `✅ ${success}/${toRemove.length} usuarios eliminados.`
              });
            }
            break;

          case 'promote':
            if (!isAdmin) {
              await socket.sendMessage(groupId, {
                text: '❌ Solo admins pueden usar este comando.'
              });
              break;
            }
            const toPromote = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (toPromote.length > 0) {
              await groupManager.promoteParticipants(groupId, toPromote);
              await socket.sendMessage(groupId, {
                text: `✅ Usuarios promovidos a administradores.`,
                mentions: toPromote
              });
            }
            break;

          case 'demote':
            if (!isAdmin) {
              await socket.sendMessage(groupId, {
                text: '❌ Solo admins pueden usar este comando.'
              });
              break;
            }
            const toDemote = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (toDemote.length > 0) {
              await groupManager.demoteParticipants(groupId, toDemote);
              await socket.sendMessage(groupId, {
                text: `✅ Usuarios degradados a miembros normales.`,
                mentions: toDemote
              });
            }
            break;

          case 'mute':
            if (!isAdmin) {
              await socket.sendMessage(groupId, {
                text: '❌ Solo admins pueden usar este comando.'
              });
              break;
            }
            const toMute = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const duration = parseInt(args[0]) || 3600000; // 1 hora por defecto
            if (toMute.length > 0) {
              toMute.forEach(jid => {
                groupManager.muteUser(groupId, jid, duration, 'Silenciado por admin');
              });
              await socket.sendMessage(groupId, {
                text: `🔇 ${toMute.length} usuario(s) silenciado(s) por ${duration/60000} minutos.`,
                mentions: toMute
              });
            }
            break;

          case 'unmute':
            if (!isAdmin) {
              await socket.sendMessage(groupId, {
                text: '❌ Solo admins pueden usar este comando.'
              });
              break;
            }
            const toUnmute = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (toUnmute.length > 0) {
              toUnmute.forEach(jid => {
                groupManager.unmuteUser(groupId, jid);
              });
              await socket.sendMessage(groupId, {
                text: `🔊 ${toUnmute.length} usuario(s) des-silenciado(s).`,
                mentions: toUnmute
              });
            }
            break;

          case 'link':
            if (!isAdmin) {
              await socket.sendMessage(groupId, {
                text: '❌ Solo admins pueden usar este comando.'
              });
              break;
            }
            const inviteCode = await groupManager.getGroupInviteCode(groupId);
            if (inviteCode) {
              await socket.sendMessage(groupId, {
                text: `🔗 Enlace de invitación:\nhttps://chat.whatsapp.com/${inviteCode}`
              });
            }
            break;

          case 'revokelink':
            if (!isAdmin) {
              await socket.sendMessage(groupId, {
                text: '❌ Solo admins pueden usar este comando.'
              });
              break;
            }
            const newCode = await groupManager.revokeGroupInviteCode(groupId);
            if (newCode) {
              await socket.sendMessage(groupId, {
                text: `✅ Enlace revocado. Nuevo enlace:\nhttps://chat.whatsapp.com/${newCode}`
              });
            }
            break;

          case 'settings':
          case 'config':
            if (!isAdmin) {
              await socket.sendMessage(groupId, {
                text: '❌ Solo admins pueden usar este comando.'
              });
              break;
            }
            const metadata = await groupManager.getGroupMetadata(groupId);
            const stats = groupManager.getStats();
            
            await socket.sendMessage(groupId, {
              text: `⚙️ *Configuración del Grupo*\n\n` +
                    `📋 Nombre: ${metadata.data?.subject}\n` +
                    `👥 Miembros: ${metadata.data?.participants.length}\n` +
                    `👑 Admins: ${(await groupManager.getAdmins(groupId)).length}\n` +
                    `🔇 Silenciados: ${groupManager.getMutedUsers(groupId).length}\n` +
                    `📜 Reglas activas: ${stats.activeRules}\n` +
                    `🔒 Solo admins: ${metadata.data?.announce ? 'Sí' : 'No'}\n` +
                    `🔐 Grupo cerrado: ${metadata.data?.restrict ? 'Sí' : 'No'}`
            });
            break;

          case 'rules':
            await socket.sendMessage(groupId, {
              text: `📜 *Reglas del Grupo*\n\n` +
                    `1. Respeta a todos los miembros\n` +
                    `2. No spam ni floods\n` +
                    `3. No enlaces sin permiso\n` +
                    `4. Mantén un lenguaje apropiado\n` +
                    `5. Sigue las indicaciones de los admins\n\n` +
                    `⚠️ El incumplimiento puede resultar en advertencias, silenciado o expulsión.`
            });
            break;

          case 'help':
            const helpText = isAdmin 
              ? `🤖 *Comandos de Administración*\n\n` +
                `👥 *Gestión de Miembros:*\n` +
                `• !add @user - Agregar miembros\n` +
                `• !kick @user - Eliminar miembros\n` +
                `• !promote @user - Promover a admin\n` +
                `• !demote @user - Degradar admin\n` +
                `• !mute @user [minutos] - Silenciar usuario\n` +
                `• !unmute @user - Des-silenciar usuario\n\n` +
                `⚙️ *Configuración:*\n` +
                `• !settings - Ver configuración\n` +
                `• !link - Obtener enlace\n` +
                `• !revokelink - Revocar enlace\n` +
                `• !panel - Panel interactivo\n\n` +
                `📋 *Información:*\n` +
                `• !rules - Ver reglas\n` +
                `• !help - Este mensaje`
              : `🤖 *Comandos Disponibles*\n\n` +
                `• !rules - Ver reglas del grupo\n` +
                `• !help - Ver esta ayuda`;
            
            await socket.sendMessage(groupId, { text: helpText });
            break;
        }
      }
    }
  });

  console.log('✅ Bot en funcionamiento con sistema de administración avanzado');
}

// Ejecutar
setupAdvancedGroupManagement().catch(console.error);
