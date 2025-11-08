
import { SoblendBaileys, AutoUpdater } from './index';

async function main() {
  console.log('🚀 Soblend Baileys - Auto Updater Demo\n');

  const soblend = new SoblendBaileys({
    printQRInTerminal: true,
    enableCache: true,
    logLevel: 'info',
  });

  try {
    const socket = await soblend.connect('auth_info');
    const updater = new AutoUpdater();

    console.log('✅ Connected to WhatsApp!\n');
    console.log('🔍 Checking for updates...\n');

    const updateInfo = await updater.checkForUpdates();

    console.log('📦 Current version:', updateInfo.currentVersion);
    console.log('✨ Latest version:', updateInfo.latestVersion);
    console.log('🆕 Has update:', updateInfo.hasUpdate);

    if (updateInfo.hasUpdate) {
      console.log('\n📝 Release notes:');
      console.log(updateInfo.releaseNotes.substring(0, 300) + '...\n');
    }

    const ownerJid = 'YOUR_NUMBER@s.whatsapp.net';
    
    updater.startAutoCheck(socket, ownerJid, 24);
    console.log('🔔 Auto-update checker started (checks every 24 hours)\n');

    socket.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || '';

        if (text.toLowerCase() === '!checkupdate') {
          const info = await updater.checkForUpdates();
          await socket.sendMessage(msg.key.remoteJid!, {
            text: `📦 Versión actual: ${info.currentVersion}\n` +
                  `✨ Última versión: ${info.latestVersion}\n` +
                  `🆕 Actualización disponible: ${info.hasUpdate ? 'Sí' : 'No'}`,
          });
        }

        if (text.toLowerCase() === '!update') {
          await socket.sendMessage(msg.key.remoteJid!, {
            text: '🔄 Iniciando actualización...',
          });

          const result = await updater.performUpdate();
          
          await socket.sendMessage(msg.key.remoteJid!, {
            text: result.message,
          });
        }
      }
    });

    console.log('💬 Comandos disponibles:');
    console.log('   !checkupdate - Verificar actualizaciones');
    console.log('   !update - Actualizar el paquete\n');

    process.on('SIGINT', async () => {
      console.log('\n👋 Cerrando...');
      updater.stopAutoCheck();
      await soblend.cleanup();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
