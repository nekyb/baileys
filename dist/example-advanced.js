"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
async function mainAdvanced() {
    console.log('🚀 Soblend Baileys - Advanced Features Demo');
    console.log('===========================================\n');
    const storage = new index_1.SoblendStorage('./bot_database', true, 'MySecurePassword123!');
    await storage.initialize();
    console.log('✅ Database initialized with encryption');
    const microservices = new index_1.MicroserviceBridge();
    console.log('✅ Microservice bridge ready');
    const soblend = new index_1.SoblendBaileys({
        printQRInTerminal: true,
        enableCache: true,
        enableAntiSpam: true,
        enableRateLimit: true,
        enablePlugins: true,
        logLevel: 'info',
    });
    console.log('\n📱 Connecting to WhatsApp...\n');
    try {
        const socket = await soblend.connect('auth_info');
        const groupManager = new index_1.GroupAdminManager(socket);
        console.log('\n✅ Connected! Advanced features available:');
        console.log('   🗄️  Encrypted Database (BSONLite)');
        console.log('   🔗 Microservice Orchestration (MykloreJS)');
        console.log('   👥 Advanced Group Management');
        console.log('   📊 Persistent User Statistics');
        console.log('   💾 Backup & Restore\n');
        socket.ev.on('messages.upsert', async ({ messages }) => {
            for (const msg of messages) {
                if (!msg.message || msg.key.fromMe)
                    continue;
                const sender = msg.key.remoteJid;
                const text = msg.message.conversation ||
                    msg.message.extendedTextMessage?.text || '';
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
                        points: 0,
                    };
                }
                user.messageCount++;
                user.lastSeen = Date.now();
                await storage.saveUser(user);
                await storage.incrementUserLevel(sender, 5);
                console.log(`\n📩 ${sender}: ${text}`);
                if (text.toLowerCase() === '!level') {
                    const userData = storage.getUser(sender);
                    await socket.sendMessage(sender, {
                        text: `📊 *Tu Perfil*\n\n` +
                            `Nivel: ${userData?.level || 0}\n` +
                            `Puntos: ${userData?.points || 0}\n` +
                            `Mensajes: ${userData?.messageCount || 0}`,
                    });
                }
                if (text.toLowerCase() === '!top') {
                    const topUsers = await storage.getTopUsers(5);
                    let leaderboard = '🏆 *Top 5 Usuarios*\n\n';
                    topUsers.forEach((u, i) => {
                        leaderboard += `${i + 1}. Nivel ${u.level} - ${u.points} puntos\n`;
                    });
                    await socket.sendMessage(sender, { text: leaderboard });
                }
                if (text.toLowerCase().startsWith('!creategroup')) {
                    const args = text.split(' ');
                    const groupName = args.slice(1).join(' ') || 'Nuevo Grupo';
                    const result = await groupManager.createGroup(groupName, [sender]);
                    if (result.success) {
                        await socket.sendMessage(sender, {
                            text: `✅ Grupo "${groupName}" creado exitosamente!\nID: ${result.groupId}`,
                        });
                        await storage.saveGroup({
                            jid: result.groupId,
                            name: groupName,
                            participants: [sender],
                            admins: [sender],
                            settings: {
                                locked: false,
                                announceOnly: false,
                                allowMemberAdd: true,
                            },
                        });
                    }
                }
                if (text.toLowerCase().startsWith('!promote') && msg.key.remoteJid?.endsWith('@g.us')) {
                    const groupId = msg.key.remoteJid;
                    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    if (mentioned.length > 0) {
                        const result = await groupManager.promoteParticipants(groupId, mentioned);
                        await socket.sendMessage(groupId, {
                            text: `✅ ${mentioned.length} usuario(s) promovido(s) a admin`,
                        });
                    }
                }
                if (text.toLowerCase().startsWith('!demote') && msg.key.remoteJid?.endsWith('@g.us')) {
                    const groupId = msg.key.remoteJid;
                    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    if (mentioned.length > 0) {
                        await groupManager.demoteParticipants(groupId, mentioned);
                        await socket.sendMessage(groupId, {
                            text: `✅ ${mentioned.length} usuario(s) degradado(s)`,
                        });
                    }
                }
                if (text.toLowerCase() === '!groupinfo' && msg.key.remoteJid?.endsWith('@g.us')) {
                    const groupId = msg.key.remoteJid;
                    const metadata = await groupManager.getGroupMetadata(groupId);
                    if (metadata.success) {
                        const data = metadata.data;
                        await socket.sendMessage(groupId, {
                            text: `📋 *Información del Grupo*\n\n` +
                                `Nombre: ${data.subject}\n` +
                                `Creado: ${new Date(data.creation * 1000).toLocaleDateString()}\n` +
                                `Participantes: ${data.participants.length}\n` +
                                `Descripción: ${data.desc || 'Sin descripción'}`,
                        });
                    }
                }
                if (text.toLowerCase() === '!backup') {
                    await storage.backup('./bot_backup');
                    await socket.sendMessage(sender, {
                        text: '✅ Backup creado exitosamente en ./bot_backup',
                    });
                }
                if (text.toLowerCase() === '!ai' && text.length > 4) {
                    const question = text.substring(4);
                    microservices.registerService({
                        name: 'ai-service',
                        baseUrl: 'https://api.example.com',
                        endpoints: { chat: '/v1/chat' },
                    });
                    const response = await microservices.processAIMessage(question, sender);
                    if (response.success) {
                        await socket.sendMessage(sender, {
                            text: `🤖 AI Response:\n${response.data}`,
                        });
                    }
                    else {
                        await socket.sendMessage(sender, {
                            text: `❌ Error: ${response.error}`,
                        });
                    }
                }
                if (text.toLowerCase() === '!advhelp') {
                    await socket.sendMessage(sender, {
                        text: `🤖 *Comandos Avanzados*\n\n` +
                            `*Perfil & Rankings:*\n` +
                            `• !level - Tu nivel y puntos\n` +
                            `• !top - Top 5 usuarios\n\n` +
                            `*Grupos:*\n` +
                            `• !creategroup <nombre> - Crear grupo\n` +
                            `• !promote @user - Promover a admin\n` +
                            `• !demote @user - Quitar admin\n` +
                            `• !groupinfo - Info del grupo\n\n` +
                            `*Sistema:*\n` +
                            `• !backup - Crear backup\n` +
                            `• !ai <pregunta> - Consultar IA\n\n` +
                            `✨ Powered by @soblend/baileys con:\n` +
                            `• BSONLite (Base de datos cifrada)\n` +
                            `• MykloreJS (Microservicios)\n` +
                            `• Sistema de niveles\n` +
                            `• Gestión avanzada de grupos`,
                    });
                }
            }
        });
        socket.ev.on('group-participants.update', async (update) => {
            const { id: groupId, participants, action } = update;
            const config = storage.getConfig();
            if (action === 'add') {
                for (const participant of participants) {
                    const welcomeMsg = config.welcomeMessage
                        .replace('{user}', `@${participant.split('@')[0]}`)
                        .replace('{group}', groupId);
                    await socket.sendMessage(groupId, {
                        text: welcomeMsg,
                        mentions: [participant],
                    });
                }
            }
            if (action === 'remove') {
                for (const participant of participants) {
                    const goodbyeMsg = config.goodbyeMessage
                        .replace('{user}', `@${participant.split('@')[0]}`)
                        .replace('{group}', groupId);
                    await socket.sendMessage(groupId, {
                        text: goodbyeMsg,
                        mentions: [participant],
                    });
                }
            }
            const group = storage.getGroup(groupId);
            if (group) {
                if (action === 'add') {
                    group.participants.push(...participants);
                }
                else if (action === 'remove') {
                    group.participants = group.participants.filter(p => !participants.includes(p));
                }
                else if (action === 'promote') {
                    group.admins.push(...participants);
                }
                else if (action === 'demote') {
                    group.admins = group.admins.filter(p => !participants.includes(p));
                }
                await storage.saveGroup(group);
            }
        });
        setInterval(() => {
            const stats = socket.getAdminStats();
            console.log(`\n📊 [${new Date().toLocaleTimeString()}] Stats:`);
            console.log(`   Messages: ${stats.messageCount} | Spam blocked: ${stats.blockedSpam}`);
            console.log(`   Cache hit rate: ${((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100).toFixed(2)}%`);
        }, 300000);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
mainAdvanced().catch(console.error);
