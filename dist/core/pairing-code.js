"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairingCodeManager = void 0;
const logger_1 = require("@imjxsx/logger");
const logger = new logger_1.Logger({
    name: "PairingCode",
    colorize: true,
    level: "INFO",
});
class PairingCodeManager {
    socket = null;
    currentCode = null;
    setSocket(socket) {
        this.socket = socket;
    }
    async requestPairingCode(options) {
        if (!this.socket) {
            throw new Error('Socket not initialized. Call setSocket() first.');
        }
        const phoneNumber = this.formatPhoneNumber(options.phoneNumber);
        if (!this.isValidPhoneNumber(phoneNumber)) {
            throw new Error('Invalid phone number format. Use international format without + (e.g., 5491234567890)');
        }
        try {
            logger.info(`Requesting pairing code for ${phoneNumber}`);
            const code = await this.socket.requestPairingCode(phoneNumber);
            this.currentCode = code;
            const formattedCode = this.formatCode(code);
            if (options.printCode !== false) {
                this.printCode(formattedCode, phoneNumber);
            }
            if (options.onCodeGenerated) {
                options.onCodeGenerated(formattedCode);
            }
            logger.success(`Pairing code generated: ${formattedCode}`);
            return formattedCode;
        }
        catch (error) {
            logger.error(`Failed to request pairing code: ${error.message}`);
            throw error;
        }
    }
    formatPhoneNumber(phoneNumber) {
        let cleaned = phoneNumber.replace(/\D/g, '');
        if (phoneNumber.startsWith('+')) {
            cleaned = phoneNumber.substring(1).replace(/\D/g, '');
        }
        return cleaned;
    }
    isValidPhoneNumber(phoneNumber) {
        return /^\d{10,15}$/.test(phoneNumber);
    }
    formatCode(code) {
        if (code.length === 8) {
            return `${code.substring(0, 4)}-${code.substring(4)}`;
        }
        return code;
    }
    printCode(code, phoneNumber) {
        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║      🔗 CÓDIGO DE VINCULACIÓN             ║');
        console.log('╠════════════════════════════════════════════╣');
        console.log(`║  Número: ${phoneNumber.padEnd(30)} ║`);
        console.log('║                                            ║');
        console.log(`║         CÓDIGO: ${code}              ║`);
        console.log('║                                            ║');
        console.log('╠════════════════════════════════════════════╣');
        console.log('║  📱 Instrucciones:                        ║');
        console.log('║  1. Abre WhatsApp en tu teléfono          ║');
        console.log('║  2. Ve a Ajustes > Dispositivos           ║');
        console.log('║     vinculados                            ║');
        console.log('║  3. Toca "Vincular un dispositivo"        ║');
        console.log('║  4. Selecciona "Vincular con número de    ║');
        console.log('║     teléfono"                             ║');
        console.log('║  5. Ingresa el código mostrado arriba     ║');
        console.log('╚════════════════════════════════════════════╝\n');
    }
    getCurrentCode() {
        return this.currentCode;
    }
    clearCode() {
        this.currentCode = null;
    }
}
exports.PairingCodeManager = PairingCodeManager;
