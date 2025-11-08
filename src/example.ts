
import { SoblendBaileys } from './index';
import { logger } from './utils/logger';

async function main() {
  logger.printBanner();
  logger.printFeatures();
  logger.separator();

  logger.loading('Inicializando sistema avanzado de Baileys');
  await new Promise(resolve => setTimeout(resolve, 1000));
  logger.clearLoading();
  logger.success('Sistema inicializado correctamente');

  logger.loading('Configurando características premium');
  await new Promise(resolve => setTimeout(resolve, 800));
  logger.clearLoading();

  const soblend = new SoblendBaileys({
    printQRInTerminal: true,
    enableCache: true,
    enableAntiSpam: true,
    enableRateLimit: true,
    enableCompression: true,
    logLevel: 'info',
  });

  logger.success('Configuración completada - Modo LEGENDARIO activado');
  logger.separator();

  logger.connection('connecting', 'Estableciendo conexión segura con WhatsApp Web');

  try {
    logger.loading('Autenticando credenciales');
    const socket = await soblend.connect('auth_info');
    logger.clearLoading();

    logger.connection('connected', '¡Conexión establecida! Bot operativo al 100%');
    logger.success('Todas las características premium están activas');
    logger.separator();

    socket.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const sender = msg.key.remoteJid!;
        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || '';

        logger.message(sender, text, 'incoming');

        if (text.toLowerCase() === 'buttons') {
          logger.info('Enviando botones interactivos...');
          await socket.sendInteractiveButtons(sender, {
            text: '¡Hola! Aquí tienes botones interactivos:',
            footer: 'Powered by @soblend/baileys',
            buttons: [
              {
                buttonId: 'btn1',
                buttonText: { displayText: '✅ Opción 1' },
                type: 1,
              },
              {
                buttonId: 'btn2',
                buttonText: { displayText: '⚡ Opción 2' },
                type: 1,
              },
              {
                buttonId: 'btn3',
                buttonText: { displayText: '🚀 Opción 3' },
                type: 1,
              },
            ],
          });
          logger.success('Botones interactivos enviados');
        }

        if (text.toLowerCase() === 'list') {
          logger.info('Enviando lista interactiva...');
          await socket.sendInteractiveList(sender, {
            text: 'Selecciona una opción del menú:',
            footer: 'Powered by @soblend/baileys',
            listMessage: {
              title: '📋 Menú Principal',
              buttonText: 'Ver Opciones',
              sections: [
                {
                  title: 'Categoría 1',
                  rows: [
                    { rowId: 'opt1', title: 'Opción 1', description: 'Descripción de la opción 1' },
                    { rowId: 'opt2', title: 'Opción 2', description: 'Descripción de la opción 2' },
                  ],
                },
                {
                  title: 'Categoría 2',
                  rows: [
                    { rowId: 'opt3', title: 'Opción 3', description: 'Descripción de la opción 3' },
                    { rowId: 'opt4', title: 'Opción 4', description: 'Descripción de la opción 4' },
                  ],
                },
              ],
            },
          });
          logger.success('Lista interactiva enviada');
        }

        if (text.toLowerCase() === 'poll') {
          logger.info('Enviando encuesta...');
          await socket.sendPoll(sender, '¿Cuál es tu lenguaje favorito?', [
            'JavaScript',
            'Python',
            'TypeScript',
            'Go',
            'Rust',
          ]);
          logger.success('Encuesta enviada');
        }

        if (text.toLowerCase() === 'stats') {
          const stats = socket.getAdminStats();
          logger.stats(stats);
          
          const uptime = Math.floor(stats.uptime / 1000);
          const hours = Math.floor(uptime / 3600);
          const minutes = Math.floor((uptime % 3600) / 60);
          const seconds = uptime % 60;

          await socket.sendMessage(sender, {
            text: `📊 *Estadísticas del Bot*\n\n` +
                  `⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s\n` +
                  `💬 Mensajes procesados: ${stats.messageCount}\n` +
                  `🚫 Spam bloqueado: ${stats.blockedSpam}\n` +
                  `⏳ Rate limit hits: ${stats.rateLimitHits}\n` +
                  `💾 Cache hits: ${stats.cacheHits}\n` +
                  `❌ Cache misses: ${stats.cacheMisses}\n` +
                  `📈 Cache hit rate: ${((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100).toFixed(2)}%`,
          });
          logger.message(sender, 'Estadísticas enviadas', 'outgoing');
        }

        if (text.toLowerCase() === 'help') {
          await socket.sendMessage(sender, {
            text: `🤖 *Soblend Baileys - Comandos Disponibles*\n\n` +
                  `• *buttons* - Muestra botones interactivos\n` +
                  `• *list* - Muestra una lista interactiva\n` +
                  `• *poll* - Crea una encuesta\n` +
                  `• *stats* - Muestra estadísticas del bot\n` +
                  `• *help* - Muestra este mensaje\n\n` +
                  `✨ Powered by @soblend/baileys - La mejor versión mejorada de Baileys`,
          });
          logger.message(sender, 'Mensaje de ayuda enviado', 'outgoing');
        }
      }
    });

    setInterval(() => {
      const stats = socket.getAdminStats();
      logger.table('RESUMEN DE ACTIVIDAD', [
        { label: '💬 Mensajes Procesados', value: stats.messageCount },
        { label: '🚫 Spam Bloqueado', value: stats.blockedSpam },
        { label: '💾 Cache Hits', value: stats.cacheHits },
        { label: '❌ Cache Misses', value: stats.cacheMisses },
        { label: '⏳ Rate Limit Hits', value: stats.rateLimitHits },
      ]);
    }, 60000);

    logger.separator();
    logger.footer();

  } catch (error) {
    logger.error(`Error al conectar: ${error}`);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error(`Error crítico: ${error}`);
  console.error(error);
});
