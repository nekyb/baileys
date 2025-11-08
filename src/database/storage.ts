import BSONLite from '@imjxsx/bsonlite';

export interface UserData {
  jid: string;
  name?: string;
  messageCount: number;
  firstSeen: number;
  lastSeen: number;
  isBlocked: boolean;
  isBanned: boolean;
  level: number;
  points: number;
  metadata?: any;
}

export interface ChatData {
  jid: string;
  messages: any[];
  lastMessage?: any;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  metadata?: any;
}

export interface GroupData {
  jid: string;
  name: string;
  description?: string;
  participants: string[];
  admins: string[];
  settings: {
    locked: boolean;
    announceOnly: boolean;
    allowMemberAdd: boolean;
  };
  metadata?: any;
}

export interface BotConfig {
  botName: string;
  prefix: string;
  ownerJid: string;
  autoRead: boolean;
  autoTyping: boolean;
  welcomeMessage: string;
  goodbyeMessage: string;
  antiLink: boolean;
  antiSpam: boolean;
  [key: string]: any;
}

export class SoblendStorage {
  private db: BSONLite<any>;
  private dbPath: string;
  private encrypted: boolean;
  private password?: string;

  constructor(dbPath: string = './soblend_data', encrypted: boolean = true, password?: string) {
    this.dbPath = dbPath;
    this.encrypted = encrypted;
    this.password = password || 'Soblend@Baileys2025!';
    this.db = new BSONLite<any>(this.dbPath, undefined, this.encrypted, this.password);
  }

  async initialize(): Promise<void> {
    await this.db.load();
    
    if (!this.db.has('users')) {
      this.db.set('users', {});
    }
    if (!this.db.has('chats')) {
      this.db.set('chats', {});
    }
    if (!this.db.has('groups')) {
      this.db.set('groups', {});
    }
    if (!this.db.has('config')) {
      this.db.set('config', this.getDefaultConfig());
    }
    
    await this.db.save();
  }

  private getDefaultConfig(): BotConfig {
    return {
      botName: 'Soblend Bot',
      prefix: '!',
      ownerJid: '',
      autoRead: false,
      autoTyping: true,
      welcomeMessage: '¡Bienvenido {user} al grupo {group}!',
      goodbyeMessage: 'Adiós {user}, te extrañaremos.',
      antiLink: false,
      antiSpam: true,
    };
  }

  async saveUser(userData: UserData): Promise<void> {
    this.db.set(`users.${userData.jid}`, userData);
    await this.db.save();
  }

  getUser(jid: string): UserData | null {
    return this.db.get(`users.${jid}`) || null;
  }

  async getAllUsers(): Promise<Record<string, UserData>> {
    return this.db.get('users') || {};
  }

  async updateUser(jid: string, updates: Partial<UserData>): Promise<void> {
    const user = this.getUser(jid);
    if (user) {
      this.db.set(`users.${jid}`, { ...user, ...updates });
      await this.db.save();
    }
  }

  async saveChat(chatData: ChatData): Promise<void> {
    this.db.set(`chats.${chatData.jid}`, chatData);
    await this.db.save();
  }

  getChat(jid: string): ChatData | null {
    return this.db.get(`chats.${jid}`) || null;
  }

  async getAllChats(): Promise<Record<string, ChatData>> {
    return this.db.get('chats') || {};
  }

  async saveGroup(groupData: GroupData): Promise<void> {
    this.db.set(`groups.${groupData.jid}`, groupData);
    await this.db.save();
  }

  getGroup(jid: string): GroupData | null {
    return this.db.get(`groups.${jid}`) || null;
  }

  async getAllGroups(): Promise<Record<string, GroupData>> {
    return this.db.get('groups') || {};
  }

  async updateGroup(jid: string, updates: Partial<GroupData>): Promise<void> {
    const group = this.getGroup(jid);
    if (group) {
      this.db.set(`groups.${jid}`, { ...group, ...updates });
      await this.db.save();
    }
  }

  getConfig(): BotConfig {
    return this.db.get('config') || this.getDefaultConfig();
  }

  async updateConfig(updates: Partial<BotConfig>): Promise<void> {
    const config = this.getConfig();
    this.db.set('config', { ...config, ...updates });
    await this.db.save();
  }

  async setConfigValue(key: string, value: any): Promise<void> {
    this.db.set(`config.${key}`, value);
    await this.db.save();
  }

  getConfigValue(key: string): any {
    return this.db.get(`config.${key}`);
  }

  async addMessageToChat(jid: string, message: any): Promise<void> {
    const chat = this.getChat(jid) || {
      jid,
      messages: [],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
    };

    chat.messages.push(message);
    chat.lastMessage = message;
    
    if (chat.messages.length > 100) {
      chat.messages = chat.messages.slice(-100);
    }

    await this.saveChat(chat);
  }

  async banUser(jid: string): Promise<void> {
    await this.updateUser(jid, { isBanned: true });
  }

  async unbanUser(jid: string): Promise<void> {
    await this.updateUser(jid, { isBanned: false });
  }

  async blockUser(jid: string): Promise<void> {
    await this.updateUser(jid, { isBlocked: true });
  }

  async unblockUser(jid: string): Promise<void> {
    await this.updateUser(jid, { isBlocked: false });
  }

  async incrementUserLevel(jid: string, points: number = 10): Promise<void> {
    const user = this.getUser(jid);
    if (user) {
      const newPoints = (user.points || 0) + points;
      const newLevel = Math.floor(newPoints / 100);
      await this.updateUser(jid, { points: newPoints, level: newLevel });
    }
  }

  async getTopUsers(limit: number = 10): Promise<UserData[]> {
    const users = await this.getAllUsers();
    return Object.values(users)
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
  }

  async backup(backupPath: string): Promise<void> {
    const allData = {
      users: await this.getAllUsers(),
      chats: await this.getAllChats(),
      groups: await this.getAllGroups(),
      config: this.getConfig(),
    };
    
    const backupDb = new BSONLite<any>(backupPath, undefined, true, this.password);
    await backupDb.load();
    backupDb.set('backup', allData);
    backupDb.set('timestamp', Date.now());
    await backupDb.save();
  }

  async clearAllData(): Promise<void> {
    this.db.set('users', {});
    this.db.set('chats', {});
    this.db.set('groups', {});
    await this.db.save();
  }
}
