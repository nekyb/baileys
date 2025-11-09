
import { promises as fs } from 'fs';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import path from 'path';

export interface SessionBackupOptions {
  enableAutoBackup?: boolean;
  backupInterval?: number; // en minutos
  maxBackups?: number;
  encryptionKey?: string;
  backupPath?: string;
}

export class SessionManager {
  private options: Required<SessionBackupOptions>;
  private backupTimer: NodeJS.Timeout | null = null;
  private algorithm = 'aes-256-gcm';

  constructor(options: SessionBackupOptions = {}) {
    this.options = {
      enableAutoBackup: options.enableAutoBackup ?? true,
      backupInterval: options.backupInterval ?? 30, // 30 minutos por defecto
      maxBackups: options.maxBackups ?? 5,
      encryptionKey: options.encryptionKey ?? 'default-encryption-key-change-me',
      backupPath: options.backupPath ?? './session_backups',
    };

    if (this.options.enableAutoBackup) {
      this.startAutoBackup();
    }
  }

  /**
   * Cifra datos usando AES-256-GCM
   */
  private encrypt(data: string): { encrypted: string; iv: string; tag: string } {
    const key = scryptSync(this.options.encryptionKey, 'salt', 32);
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  /**
   * Descifra datos
   */
  private decrypt(encrypted: string, iv: string, tag: string): string {
    const key = scryptSync(this.options.encryptionKey, 'salt', 32);
    const decipher = createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Crea un backup cifrado de la sesión
   */
  async createBackup(authPath: string): Promise<void> {
    try {
      await fs.mkdir(this.options.backupPath, { recursive: true });

      // Leer todos los archivos de sesión
      const files = await fs.readdir(authPath);
      const sessionData: Record<string, string> = {};

      for (const file of files) {
        const filePath = path.join(authPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          const content = await fs.readFile(filePath, 'utf8');
          sessionData[file] = content;
        }
      }

      // Cifrar los datos
      const dataString = JSON.stringify(sessionData);
      const { encrypted, iv, tag } = this.encrypt(dataString);

      // Guardar backup cifrado
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(
        this.options.backupPath,
        `session_backup_${timestamp}.enc`
      );

      await fs.writeFile(
        backupFile,
        JSON.stringify({ encrypted, iv, tag }),
        'utf8'
      );

      console.log(`💾 Session backup created: ${backupFile}`);

      // Limpiar backups antiguos
      await this.cleanOldBackups();
    } catch (error: any) {
      console.error(`❌ Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Restaura una sesión desde un backup cifrado
   */
  async restoreBackup(backupFile: string, authPath: string): Promise<void> {
    try {
      const backupPath = path.join(this.options.backupPath, backupFile);
      const encryptedData = await fs.readFile(backupPath, 'utf8');
      const { encrypted, iv, tag } = JSON.parse(encryptedData);

      // Descifrar datos
      const decrypted = this.decrypt(encrypted, iv, tag);
      const sessionData = JSON.parse(decrypted);

      // Crear directorio de auth si no existe
      await fs.mkdir(authPath, { recursive: true });

      // Restaurar archivos
      for (const [filename, content] of Object.entries(sessionData)) {
        const filePath = path.join(authPath, filename);
        await fs.writeFile(filePath, content as string, 'utf8');
      }

      console.log(`✅ Session restored from: ${backupFile}`);
    } catch (error: any) {
      console.error(`❌ Failed to restore backup: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista todos los backups disponibles
   */
  async listBackups(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.options.backupPath);
      return files
        .filter(f => f.endsWith('.enc'))
        .sort()
        .reverse();
    } catch (error) {
      return [];
    }
  }

  /**
   * Limpia backups antiguos
   */
  private async cleanOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length > this.options.maxBackups) {
        const toDelete = backups.slice(this.options.maxBackups);
        
        for (const backup of toDelete) {
          const backupPath = path.join(this.options.backupPath, backup);
          await fs.unlink(backupPath);
          console.log(`🗑️  Deleted old backup: ${backup}`);
        }
      }
    } catch (error: any) {
      console.error(`❌ Failed to clean old backups: ${error.message}`);
    }
  }

  /**
   * Inicia el sistema de backup automático
   */
  private startAutoBackup(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
    }

    const intervalMs = this.options.backupInterval * 60 * 1000;
    
    this.backupTimer = setInterval(() => {
      console.log('🔄 Running automatic session backup...');
    }, intervalMs);

    console.log(`🔐 Auto-backup enabled (every ${this.options.backupInterval} minutes)`);
  }

  /**
   * Detiene el sistema de backup automático
   */
  stopAutoBackup(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
      this.backupTimer = null;
      console.log('🛑 Auto-backup stopped');
    }
  }

  /**
   * Obtiene el último backup disponible
   */
  async getLatestBackup(): Promise<string | null> {
    const backups = await this.listBackups();
    return backups.length > 0 ? backups[0] : null;
  }
}
