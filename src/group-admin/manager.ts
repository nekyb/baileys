
import { SoblendSocket } from '../types';
import { logger } from '../utils/logger';

export interface GroupSettings {
  announceOnly?: boolean;
  locked?: boolean;
  allowMemberAdd?: boolean;
  restrictMessages?: boolean;
}

export interface ParticipantAction {
  jid: string;
  action: 'add' | 'remove' | 'promote' | 'demote' | 'mute' | 'unmute';
  success: boolean;
  error?: string;
}

export interface GroupPermissions {
  sendMessages: boolean;
  sendMedia: boolean;
  changeGroupInfo: boolean;
  addMembers: boolean;
}

export interface GroupRule {
  id: string;
  type: 'anti-link' | 'anti-spam' | 'anti-bad-words' | 'custom';
  enabled: boolean;
  action: 'warn' | 'mute' | 'kick';
  message?: string;
  patterns?: RegExp[];
}

export interface WelcomeMessage {
  enabled: boolean;
  text: string;
  media?: Buffer | string;
  buttons?: boolean;
}

export interface GroupEventListener {
  onMemberJoin?: (groupId: string, members: string[]) => void | Promise<void>;
  onMemberLeave?: (groupId: string, members: string[]) => void | Promise<void>;
  onMemberPromote?: (groupId: string, members: string[]) => void | Promise<void>;
  onMemberDemote?: (groupId: string, members: string[]) => void | Promise<void>;
  onGroupNameChange?: (groupId: string, oldName: string, newName: string) => void | Promise<void>;
  onGroupDescriptionChange?: (groupId: string, newDescription: string) => void | Promise<void>;
  onGroupPhotoChange?: (groupId: string) => void | Promise<void>;
  onGroupSettingsChange?: (groupId: string, settings: GroupSettings) => void | Promise<void>;
}

export interface MutedUser {
  jid: string;
  until?: number; // timestamp, undefined = permanent
  reason?: string;
}

export class AdvancedGroupAdminManager {
  private socket: SoblendSocket;
  private groupCache: Map<string, any> = new Map();
  private mutedUsers: Map<string, MutedUser[]> = new Map();
  private groupRules: Map<string, GroupRule[]> = new Map();
  private welcomeMessages: Map<string, WelcomeMessage> = new Map();
  private goodbyeMessages: Map<string, WelcomeMessage> = new Map();
  private eventListeners: Map<string, GroupEventListener> = new Map();
  private messageHistory: Map<string, Map<string, number[]>> = new Map(); // groupId -> userId -> timestamps
  private cacheExpiry: number = 300000; // 5 minutes

  constructor(socket: SoblendSocket) {
    this.socket = socket;
    this.setupEventListeners();
    this.startCacheCleanup();
  }

  // ============================================
  // GESTIÓN BÁSICA DE GRUPOS
  // ============================================

  async createGroup(name: string, participants: string[]): Promise<any> {
    try {
      logger.info(`Creating group "${name}" with ${participants.length} participants`);
      const result = await this.socket.groupCreate(name, participants);
      
      // Invalidar caché
      this.groupCache.delete(result.id);
      
      return {
        success: true,
        groupId: result.id,
        data: result,
      };
    } catch (error: any) {
      logger.error(`Failed to create group: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================
  // GESTIÓN AVANZADA DE PARTICIPANTES
  // ============================================

  async addParticipants(
    groupId: string, 
    participants: string[],
    sendWelcome: boolean = true
  ): Promise<ParticipantAction[]> {
    try {
      logger.info(`Adding ${participants.length} participants to ${groupId}`);
      
      // Procesar en lotes de 10 para evitar bloqueos
      const batchSize = 10;
      const results: ParticipantAction[] = [];
      
      for (let i = 0; i < participants.length; i += batchSize) {
        const batch = participants.slice(i, i + batchSize);
        
        try {
          await this.socket.groupParticipantsUpdate(groupId, batch, 'add');
          
          batch.forEach(jid => {
            results.push({ jid, action: 'add', success: true });
          });

          // Enviar mensaje de bienvenida si está habilitado
          if (sendWelcome && this.welcomeMessages.has(groupId)) {
            await this.sendWelcomeMessages(groupId, batch);
          }
          
          // Pequeña pausa entre lotes
          if (i + batchSize < participants.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error: any) {
          logger.error(`Batch add failed: ${error.message}`);
          batch.forEach(jid => {
            results.push({ jid, action: 'add', success: false, error: error.message });
          });
        }
      }

      this.groupCache.delete(groupId);
      return results;
    } catch (error: any) {
      logger.error(`Failed to add participants: ${error.message}`);
      return participants.map(jid => ({
        jid,
        action: 'add',
        success: false,
        error: error.message,
      }));
    }
  }

  async removeParticipants(
    groupId: string, 
    participants: string[],
    reason?: string
  ): Promise<ParticipantAction[]> {
    try {
      logger.info(`Removing ${participants.length} participants from ${groupId}`);
      
      const batchSize = 10;
      const results: ParticipantAction[] = [];
      
      for (let i = 0; i < participants.length; i += batchSize) {
        const batch = participants.slice(i, i + batchSize);
        
        try {
          await this.socket.groupParticipantsUpdate(groupId, batch, 'remove');
          
          batch.forEach(jid => {
            results.push({ jid, action: 'remove', success: true });
          });
          
          if (i + batchSize < participants.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error: any) {
          logger.error(`Batch remove failed: ${error.message}`);
          batch.forEach(jid => {
            results.push({ jid, action: 'remove', success: false, error: error.message });
          });
        }
      }

      this.groupCache.delete(groupId);
      return results;
    } catch (error: any) {
      logger.error(`Failed to remove participants: ${error.message}`);
      return participants.map(jid => ({
        jid,
        action: 'remove',
        success: false,
        error: error.message,
      }));
    }
  }

  async promoteParticipants(groupId: string, participants: string[]): Promise<ParticipantAction[]> {
    try {
      logger.info(`Promoting ${participants.length} participants in ${groupId}`);
      await this.socket.groupParticipantsUpdate(groupId, participants, 'promote');
      
      this.groupCache.delete(groupId);
      
      return participants.map(jid => ({
        jid,
        action: 'promote',
        success: true,
      }));
    } catch (error: any) {
      logger.error(`Failed to promote participants: ${error.message}`);
      return participants.map(jid => ({
        jid,
        action: 'promote',
        success: false,
        error: error.message,
      }));
    }
  }

  async demoteParticipants(groupId: string, participants: string[]): Promise<ParticipantAction[]> {
    try {
      logger.info(`Demoting ${participants.length} participants in ${groupId}`);
      await this.socket.groupParticipantsUpdate(groupId, participants, 'demote');
      
      this.groupCache.delete(groupId);
      
      return participants.map(jid => ({
        jid,
        action: 'demote',
        success: true,
      }));
    } catch (error: any) {
      logger.error(`Failed to demote participants: ${error.message}`);
      return participants.map(jid => ({
        jid,
        action: 'demote',
        success: false,
        error: error.message,
      }));
    }
  }

  // ============================================
  // SISTEMA DE SILENCIADO
  // ============================================

  muteUser(groupId: string, jid: string, duration?: number, reason?: string): void {
    const muted = this.mutedUsers.get(groupId) || [];
    
    // Remover silenciado previo si existe
    const filtered = muted.filter(m => m.jid !== jid);
    
    const muteEntry: MutedUser = {
      jid,
      until: duration ? Date.now() + duration : undefined,
      reason,
    };
    
    filtered.push(muteEntry);
    this.mutedUsers.set(groupId, filtered);
    
    logger.info(`Muted user ${jid} in ${groupId}${duration ? ` for ${duration}ms` : ' permanently'}`);
  }

  unmuteUser(groupId: string, jid: string): void {
    const muted = this.mutedUsers.get(groupId) || [];
    const filtered = muted.filter(m => m.jid !== jid);
    this.mutedUsers.set(groupId, filtered);
    
    logger.info(`Unmuted user ${jid} in ${groupId}`);
  }

  isUserMuted(groupId: string, jid: string): boolean {
    const muted = this.mutedUsers.get(groupId) || [];
    const muteEntry = muted.find(m => m.jid === jid);
    
    if (!muteEntry) return false;
    
    // Si no tiene duración, es permanente
    if (!muteEntry.until) return true;
    
    // Verificar si ya expiró
    if (muteEntry.until < Date.now()) {
      this.unmuteUser(groupId, jid);
      return false;
    }
    
    return true;
  }

  getMutedUsers(groupId: string): MutedUser[] {
    return this.mutedUsers.get(groupId) || [];
  }

  // ============================================
  // SISTEMA DE REGLAS
  // ============================================

  addRule(groupId: string, rule: GroupRule): void {
    const rules = this.groupRules.get(groupId) || [];
    rules.push(rule);
    this.groupRules.set(groupId, rules);
    logger.info(`Added rule "${rule.id}" to group ${groupId}`);
  }

  removeRule(groupId: string, ruleId: string): void {
    const rules = this.groupRules.get(groupId) || [];
    const filtered = rules.filter(r => r.id !== ruleId);
    this.groupRules.set(groupId, filtered);
    logger.info(`Removed rule "${ruleId}" from group ${groupId}`);
  }

  toggleRule(groupId: string, ruleId: string, enabled: boolean): void {
    const rules = this.groupRules.get(groupId) || [];
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      logger.info(`${enabled ? 'Enabled' : 'Disabled'} rule "${ruleId}" in group ${groupId}`);
    }
  }

  async checkRules(groupId: string, userId: string, message: string): Promise<boolean> {
    const rules = this.groupRules.get(groupId) || [];
    
    for (const rule of rules) {
      if (!rule.enabled) continue;
      
      let violated = false;
      
      switch (rule.type) {
        case 'anti-link':
          violated = /https?:\/\/|www\./i.test(message);
          break;
          
        case 'anti-spam':
          violated = this.checkSpam(groupId, userId);
          break;
          
        case 'anti-bad-words':
          if (rule.patterns) {
            violated = rule.patterns.some(pattern => pattern.test(message));
          }
          break;
          
        case 'custom':
          if (rule.patterns) {
            violated = rule.patterns.some(pattern => pattern.test(message));
          }
          break;
      }
      
      if (violated) {
        await this.enforceRule(groupId, userId, rule);
        return false;
      }
    }
    
    return true;
  }

  private async enforceRule(groupId: string, userId: string, rule: GroupRule): Promise<void> {
    logger.info(`Rule "${rule.id}" violated by ${userId} in ${groupId}`);
    
    switch (rule.action) {
      case 'warn':
        if (rule.message) {
          await this.socket.sendMessage(groupId, { 
            text: `⚠️ @${userId.split('@')[0]}\n${rule.message}`,
            mentions: [userId]
          });
        }
        break;
        
      case 'mute':
        this.muteUser(groupId, userId, 3600000, `Violated rule: ${rule.id}`); // 1 hora
        await this.socket.sendMessage(groupId, { 
          text: `🔇 Usuario silenciado por violar reglas del grupo.`,
          mentions: [userId]
        });
        break;
        
      case 'kick':
        await this.removeParticipants(groupId, [userId], `Violated rule: ${rule.id}`);
        break;
    }
  }

  private checkSpam(groupId: string, userId: string): boolean {
    const history = this.messageHistory.get(groupId) || new Map();
    const userMessages = history.get(userId) || [];
    
    const now = Date.now();
    const recentMessages = userMessages.filter((t: number) => now - t < 10000); // 10 segundos
    
    if (recentMessages.length >= 5) {
      return true; // 5 mensajes en 10 segundos = spam
    }
    
    recentMessages.push(now);
    history.set(userId, recentMessages);
    this.messageHistory.set(groupId, history);
    
    return false;
  }

  // ============================================
  // MENSAJES DE BIENVENIDA Y DESPEDIDA
  // ============================================

  setWelcomeMessage(groupId: string, config: WelcomeMessage): void {
    this.welcomeMessages.set(groupId, config);
    logger.info(`Welcome message configured for ${groupId}`);
  }

  setGoodbyeMessage(groupId: string, config: WelcomeMessage): void {
    this.goodbyeMessages.set(groupId, config);
    logger.info(`Goodbye message configured for ${groupId}`);
  }

  private async sendWelcomeMessages(groupId: string, members: string[]): Promise<void> {
    const config = this.welcomeMessages.get(groupId);
    if (!config || !config.enabled) return;

    try {
      const metadata = await this.getGroupMetadata(groupId);
      
      for (const member of members) {
        const text = config.text
          .replace('{user}', `@${member.split('@')[0]}`)
          .replace('{group}', metadata.data?.subject || 'el grupo');

        if (config.buttons) {
          await this.socket.sendInteractiveButtons(groupId, {
            text,
            footer: '¡Bienvenido al grupo!',
            buttons: [
              {
                buttonId: 'rules',
                buttonText: { displayText: '📋 Ver Reglas' },
                type: 1
              },
              {
                buttonId: 'help',
                buttonText: { displayText: '❓ Ayuda' },
                type: 1
              }
            ]
          });
        } else {
          await this.socket.sendMessage(groupId, {
            text,
            mentions: [member]
          });
        }
        
        // Pausa entre mensajes
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error: any) {
      logger.error(`Failed to send welcome messages: ${error.message}`);
    }
  }

  // ============================================
  // INFORMACIÓN DEL GRUPO
  // ============================================

  async updateGroupName(groupId: string, name: string): Promise<boolean> {
    try {
      await this.socket.groupUpdateSubject(groupId, name);
      this.groupCache.delete(groupId);
      logger.info(`Updated group name: ${groupId} -> ${name}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update group name: ${error}`);
      return false;
    }
  }

  async updateGroupDescription(groupId: string, description: string): Promise<boolean> {
    try {
      await this.socket.groupUpdateDescription(groupId, description);
      this.groupCache.delete(groupId);
      logger.info(`Updated group description: ${groupId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update group description: ${error}`);
      return false;
    }
  }

  async getGroupMetadata(groupId: string): Promise<any> {
    try {
      // Verificar caché
      const cached = this.groupCache.get(groupId);
      if (cached && cached.timestamp > Date.now() - this.cacheExpiry) {
        return { success: true, data: cached.data };
      }

      const metadata = await this.socket.groupMetadata(groupId);
      
      // Guardar en caché
      this.groupCache.set(groupId, {
        data: metadata,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: metadata,
      };
    } catch (error: any) {
      logger.error(`Failed to get group metadata: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getGroupInviteCode(groupId: string): Promise<string | null> {
    try {
      const code = await this.socket.groupInviteCode(groupId);
      return code || null;
    } catch (error) {
      logger.error(`Failed to get invite code: ${error}`);
      return null;
    }
  }

  async revokeGroupInviteCode(groupId: string): Promise<string | null> {
    try {
      const newCode = await this.socket.groupRevokeInvite(groupId);
      logger.info(`Revoked invite code for ${groupId}`);
      return newCode || null;
    } catch (error) {
      logger.error(`Failed to revoke invite code: ${error}`);
      return null;
    }
  }

  async leaveGroup(groupId: string): Promise<boolean> {
    try {
      await this.socket.groupLeave(groupId);
      this.groupCache.delete(groupId);
      logger.info(`Left group: ${groupId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to leave group: ${error}`);
      return false;
    }
  }

  async updateGroupSettings(groupId: string, settings: GroupSettings): Promise<boolean> {
    try {
      if (settings.announceOnly !== undefined) {
        await this.socket.groupSettingUpdate(
          groupId, 
          settings.announceOnly ? 'announcement' : 'not_announcement'
        );
      }
      if (settings.locked !== undefined) {
        await this.socket.groupSettingUpdate(
          groupId, 
          settings.locked ? 'locked' : 'unlocked'
        );
      }
      
      this.groupCache.delete(groupId);
      logger.info(`Updated group settings: ${groupId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update group settings: ${error}`);
      return false;
    }
  }

  async acceptGroupInvite(inviteCode: string): Promise<string | null> {
    try {
      const groupId = await this.socket.groupAcceptInvite(inviteCode);
      logger.info(`Accepted group invite: ${groupId}`);
      return groupId || null;
    } catch (error) {
      logger.error(`Failed to accept group invite: ${error}`);
      return null;
    }
  }

  async getParticipants(groupId: string): Promise<any[]> {
    try {
      const metadata = await this.getGroupMetadata(groupId);
      return metadata.data?.participants || [];
    } catch (error) {
      logger.error(`Failed to get participants: ${error}`);
      return [];
    }
  }

  async getAdmins(groupId: string): Promise<string[]> {
    try {
      const metadata = await this.getGroupMetadata(groupId);
      if (!metadata.success || !metadata.data) {
        return [];
      }

      const participants = metadata.data.participants || [];
      return participants
        .filter((p: any) => p.admin === 'admin' || p.admin === 'superadmin')
        .map((p: any) => p.id);
    } catch (error: any) {
      logger.error(`Failed to get admins: ${error.message}`);
      return [];
    }
  }

  async isAdmin(groupId: string, jid: string): Promise<boolean> {
    try {
      const metadata = await this.getGroupMetadata(groupId);
      if (!metadata.success || !metadata.data) {
        return false;
      }

      // Normalizar JID para comparación
      const normalizedJid = jid.replace(/:\d+/, '');
      
      const participants = metadata.data.participants || [];
      const participant = participants.find((p: any) => {
        const participantJid = p.id.replace(/:\d+/, '');
        return participantJid === normalizedJid;
      });

      return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch (error: any) {
      logger.error(`Failed to check admin status for ${jid}: ${error.message}`);
      return false;
    }
  }

  async isBotAdmin(groupId: string): Promise<boolean> {
    try {
      const metadata = await this.getGroupMetadata(groupId);
      if (!metadata.success || !metadata.data) {
        logger.warn(`Failed to get metadata for ${groupId}`);
        return false;
      }

      // Obtener el JID del bot correctamente
      const botJid = this.socket.user?.id;
      if (!botJid) {
        logger.warn('Bot JID not available');
        return false;
      }

      // Normalizar el JID del bot para comparación
      const normalizedBotJid = botJid.replace(/:\d+/, '');
      
      const participants = metadata.data.participants || [];
      
      // Buscar el participante del bot comparando JIDs normalizados
      const botParticipant = participants.find((p: any) => {
        const participantJid = p.id.replace(/:\d+/, '');
        return participantJid === normalizedBotJid;
      });

      if (!botParticipant) {
        logger.warn(`Bot not found in group ${groupId} participants`);
        return false;
      }

      const isAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin';
      
      logger.debug(`Bot admin status in ${groupId}: ${isAdmin} (role: ${botParticipant.admin || 'member'})`);
      
      return isAdmin;
    } catch (error: any) {
      logger.error(`Failed to check bot admin status: ${error.message}`);
      return false;
    }
  }

  // ============================================
  // PANEL INTERACTIVO DE ADMINISTRACIÓN
  // ============================================

  async sendAdminPanel(groupId: string, userId: string): Promise<void> {
    const isAdmin = await this.isAdmin(groupId, userId);
    
    if (!isAdmin) {
      await this.socket.sendMessage(groupId, {
        text: '❌ Solo los administradores pueden usar este panel.',
      });
      return;
    }

    try {
      await this.socket.sendInteractiveList(groupId, {
        text: '🛡️ *Panel de Administración Avanzado*',
        footer: 'Selecciona una opción para gestionar el grupo',
        listMessage: {
          title: 'Opciones Administrativas',
          buttonText: '📋 Ver Opciones',
          sections: [
            {
              title: '👥 Gestión de Miembros',
              rows: [
                {
                  rowId: 'admin_list_members',
                  title: '📋 Lista de Miembros',
                  description: 'Ver todos los miembros del grupo'
                },
                {
                  rowId: 'admin_list_admins',
                  title: '👑 Lista de Admins',
                  description: 'Ver todos los administradores'
                },
                {
                  rowId: 'admin_muted_users',
                  title: '🔇 Usuarios Silenciados',
                  description: 'Ver usuarios silenciados'
                }
              ]
            },
            {
              title: '⚙️ Configuración',
              rows: [
                {
                  rowId: 'admin_settings',
                  title: '🔧 Ajustes del Grupo',
                  description: 'Configurar grupo'
                },
                {
                  rowId: 'admin_rules',
                  title: '📜 Gestión de Reglas',
                  description: 'Ver y editar reglas'
                },
                {
                  rowId: 'admin_welcome',
                  title: '👋 Mensaje de Bienvenida',
                  description: 'Configurar bienvenida'
                }
              ]
            },
            {
              title: '🔒 Seguridad',
              rows: [
                {
                  rowId: 'admin_antilink',
                  title: '🔗 Anti-Link',
                  description: 'Activar/desactivar filtro de enlaces'
                },
                {
                  rowId: 'admin_antispam',
                  title: '🚫 Anti-Spam',
                  description: 'Activar/desactivar anti-spam'
                },
                {
                  rowId: 'admin_revoke_invite',
                  title: '🔄 Revocar Enlace',
                  description: 'Generar nuevo enlace de invitación'
                }
              ]
            }
          ]
        }
      });
    } catch (error: any) {
      logger.error(`Failed to send admin panel: ${error.message}`);
    }
  }

  // ============================================
  // EVENTOS DEL GRUPO
  // ============================================

  private setupEventListeners(): void {
    this.socket.ev.on('group-participants.update', async (update: any) => {
      const { id, participants, action } = update;
      
      const listeners = this.eventListeners.get(id);
      
      switch (action) {
        case 'add':
          if (listeners?.onMemberJoin) {
            await listeners.onMemberJoin(id, participants);
          }
          await this.sendWelcomeMessages(id, participants);
          break;
          
        case 'remove':
          if (listeners?.onMemberLeave) {
            await listeners.onMemberLeave(id, participants);
          }
          // Enviar mensaje de despedida
          const goodbye = this.goodbyeMessages.get(id);
          if (goodbye && goodbye.enabled) {
            for (const member of participants) {
              const text = goodbye.text.replace('{user}', `@${member.split('@')[0]}`);
              await this.socket.sendMessage(id, {
                text,
                mentions: [member]
              });
            }
          }
          break;
          
        case 'promote':
          if (listeners?.onMemberPromote) {
            await listeners.onMemberPromote(id, participants);
          }
          break;
          
        case 'demote':
          if (listeners?.onMemberDemote) {
            await listeners.onMemberDemote(id, participants);
          }
          break;
      }
      
      // Invalidar caché
      this.groupCache.delete(id);
    });

    this.socket.ev.on('groups.update', async (updates: any[]) => {
      for (const update of updates) {
        const listeners = this.eventListeners.get(update.id);
        
        if (update.subject && listeners?.onGroupNameChange) {
          await listeners.onGroupNameChange(update.id, '', update.subject);
        }
        
        if (update.desc && listeners?.onGroupDescriptionChange) {
          await listeners.onGroupDescriptionChange(update.id, update.desc);
        }
        
        if (update.announce !== undefined && listeners?.onGroupSettingsChange) {
          await listeners.onGroupSettingsChange(update.id, {
            announceOnly: update.announce
          });
        }
        
        // Invalidar caché
        this.groupCache.delete(update.id);
      }
    });
  }

  registerEventListener(groupId: string, listeners: GroupEventListener): void {
    this.eventListeners.set(groupId, listeners);
    logger.info(`Event listeners registered for group ${groupId}`);
  }

  unregisterEventListener(groupId: string): void {
    this.eventListeners.delete(groupId);
    logger.info(`Event listeners unregistered for group ${groupId}`);
  }

  // ============================================
  // LIMPIEZA Y MANTENIMIENTO
  // ============================================

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      
      // Limpiar caché expirado
      for (const [key, value] of this.groupCache.entries()) {
        if (now - value.timestamp > this.cacheExpiry) {
          this.groupCache.delete(key);
        }
      }
      
      // Limpiar usuarios silenciados expirados
      for (const [groupId, muted] of this.mutedUsers.entries()) {
        const filtered = muted.filter(m => !m.until || m.until > now);
        if (filtered.length !== muted.length) {
          this.mutedUsers.set(groupId, filtered);
        }
      }
      
      // Limpiar historial de mensajes antiguo
      for (const [groupId, history] of this.messageHistory.entries()) {
        for (const [userId, timestamps] of history.entries()) {
          const recent = timestamps.filter(t => now - t < 60000);
          if (recent.length === 0) {
            history.delete(userId);
          } else {
            history.set(userId, recent);
          }
        }
      }
      
      logger.debug('Cache cleanup completed');
    }, 60000); // Cada minuto
  }

  clearCache(groupId?: string): void {
    if (groupId) {
      this.groupCache.delete(groupId);
      logger.info(`Cache cleared for group ${groupId}`);
    } else {
      this.groupCache.clear();
      logger.info('All cache cleared');
    }
  }

  getStats(): any {
    return {
      cachedGroups: this.groupCache.size,
      mutedUsers: Array.from(this.mutedUsers.values()).reduce((acc, val) => acc + val.length, 0),
      activeRules: Array.from(this.groupRules.values()).reduce((acc, val) => acc + val.length, 0),
      eventListeners: this.eventListeners.size,
    };
  }
}

// Exportar también la versión básica como alias para compatibilidad
export { AdvancedGroupAdminManager as GroupAdminManager };
