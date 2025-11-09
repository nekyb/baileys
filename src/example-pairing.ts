
import { SoblendBaileys } from './index';
import { logger } from './utils/logger';
import * as readline from 'readline';

async function main() {
  logger.printBanner();
  logger.separator();

  logger.info('🔗 Soblend Baileys - Vinculación con Código de Emparejamiento');
  logger.separator();

  const soblend = new SoblendBaileys({
    printQRInTerminal: false, // Desactivar QR ya que usaremos código
    enableCache: true,
    enableAntiSpam: true,
    enableRateLimit: true,
    logLevel: 'info',
  });

  try {
    logger.loading('Iniciando conexión...');
    const socket = await soblend.connect('auth_info');
    logger.clearLoading();

    // Solicitar número de teléfono al usuario
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askPhoneNumber = (): Promise<string> => {
      return new Promise((resolve) => {
        rl.question('\n📱 Ingresa tu número de WhatsApp (formato internacional sin +, ej: 5491234567890): ', (answer) => {
          resolve(answer.trim());
        });
      });
    };

    const phoneNumber = await askPhoneNumber();
    rl.close();

    logger.info(`Generando código de emparejamiento para ${phoneNumber}...`);
    logger.separator();

    // Solicitar código de emparejamiento
    const code = await soblend.requestPairingCode({
      phoneNumber: phoneNumber,
      printCode: true,
      onCodeGenerated: (generatedCode) => {
        logger.success(`✅ Código generado exitosamente: ${generatedCode}`);
      }
    });

    logger.separator();
    logger.info('⏳ Esperando vinculación...');
    logger.info('El código expira en unos minutos. Si no funciona, reinicia el proceso.');

    // Escuchar eventos de conexión
    socket.ev.on('connection.update', (update) => {
      const { connection } = update;
      
      if (connection === 'open') {
        logger.separator();
        logger.success('🎉 ¡Vinculación exitosa!');
        logger.success('Bot conectado y listo para usar');
        logger.separator();
      }
    });

    // Mantener el proceso vivo
    socket.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const sender = msg.key.remoteJid!;
        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || '';

        if (text.toLowerCase() === 'ping') {
          await socket.sendMessage(sender, {
            text: '🏓 Pong! Bot vinculado con código de emparejamiento funcionando correctamente.'
          });
        }

        if (text.toLowerCase() === 'info') {
          await socket.sendMessage(sender, {
            text: '📱 *Bot Vinculado con Código de Emparejamiento*\n\n' +
                  '✅ Conectado exitosamente usando código de 8 dígitos\n' +
                  '🔗 Sistema de vinculación: Activo\n' +
                  '⚡ Powered by @soblend/baileys\n\n' +
                  'Comandos:\n' +
                  '• ping - Verificar conexión\n' +
                  '• info - Mostrar esta información'
          });
        }
      }
    });

  } catch (error: any) {
    logger.error(`Error durante la vinculación: ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error(`Error crítico: ${error}`);
  console.error(error);
});
