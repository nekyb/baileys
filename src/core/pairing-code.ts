
import { WASocket } from '@whiskeysockets/baileys';
import { Logger } from '@imjxsx/logger';

const logger = new Logger({
  name: "PairingCode",
  colorize: true,
  level: "INFO",
});

export interface PairingCodeOptions {
  phoneNumber: string;
  printCode?: boolean;
  onCodeGenerated?: (code: string) => void;
}

export class PairingCodeManager {
  private socket: WASocket | null = null;
  private currentCode: string | null = null;

  setSocket(socket: WASocket): void {
    this.socket = socket;
  }

  /**
   * Genera y solicita un código de emparejamiento de 8 dígitos
   * @param options Opciones para generar el código
   * @returns El código de emparejamiento generado
   */
  async requestPairingCode(options: PairingCodeOptions): Promise<string> {
    if (!this.socket) {
      throw new Error('Socket not initialized. Call setSocket() first.');
    }

    // Validar número de teléfono (debe ser formato internacional sin +)
    const phoneNumber = this.formatPhoneNumber(options.phoneNumber);
    
    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format. Use international format without + (e.g., 5491234567890)');
    }

    try {
      logger.info(`Requesting pairing code for ${phoneNumber}`);
      
      // Solicitar código de emparejamiento a WhatsApp
      const code = await this.socket.requestPairingCode(phoneNumber);
      
      this.currentCode = code;

      // Formatear código para mejor legibilidad (XXXX-XXXX)
      const formattedCode = this.formatCode(code);

      if (options.printCode !== false) {
        this.printCode(formattedCode, phoneNumber);
      }

      if (options.onCodeGenerated) {
        options.onCodeGenerated(formattedCode);
      }

      logger.success(`Pairing code generated: ${formattedCode}`);
      
      return formattedCode;
    } catch (error: any) {
      logger.error(`Failed to request pairing code: ${error.message}`);
      throw error;
    }
  }

  /**
   * Formatea el número de teléfono al formato requerido
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remover todos los caracteres no numéricos
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Si empieza con +, removerlo
    if (phoneNumber.startsWith('+')) {
      cleaned = phoneNumber.substring(1).replace(/\D/g, '');
    }

    return cleaned;
  }

  /**
   * Valida que el número de teléfono tenga el formato correcto
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Debe tener entre 10 y 15 dígitos
    return /^\d{10,15}$/.test(phoneNumber);
  }

  /**
   * Formatea el código para mejor legibilidad
   */
  private formatCode(code: string): string {
    // Si el código tiene 8 dígitos, formatear como XXXX-XXXX
    if (code.length === 8) {
      return `${code.substring(0, 4)}-${code.substring(4)}`;
    }
    return code;
  }

  /**
   * Imprime el código en la consola de forma visual
   */
  private printCode(code: string, phoneNumber: string): void {
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

  /**
   * Obtiene el código actual si existe
   */
  getCurrentCode(): string | null {
    return this.currentCode;
  }

  /**
   * Limpia el código actual
   */
  clearCode(): void {
    this.currentCode = null;
  }
}
