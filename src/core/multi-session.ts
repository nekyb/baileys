
import { SoblendBaileys } from './connection';
import { SoblendSocket, SoblendConfig } from '../types';

export interface SessionInfo {
  id: string;
  name: string;
  socket: SoblendSocket | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  authPath: string;
  config: Partial<SoblendConfig>;
  connectedAt?: number;
  lastError?: string;
}

export class MultiSessionManager {
  private sessions: Map<string, SessionInfo>;
  private instances: Map<string, SoblendBaileys>;

  constructor() {
    this.sessions = new Map();
    this.instances = new Map();
  }

  createSession(id: string, name: string, config: Partial<SoblendConfig> = {}): void {
    if (this.sessions.has(id)) {
      throw new Error(`Session ${id} already exists`);
    }

    const sessionInfo: SessionInfo = {
      id,
      name,
      socket: null,
      status: 'disconnected',
      authPath: `./auth_${id}`,
      config,
    };

    this.sessions.set(id, sessionInfo);
  }

  async connectSession(id: string): Promise<SoblendSocket> {
    const sessionInfo = this.sessions.get(id);
    if (!sessionInfo) {
      throw new Error(`Session ${id} not found`);
    }

    if (sessionInfo.status === 'connected' && sessionInfo.socket) {
      return sessionInfo.socket;
    }

    try {
      sessionInfo.status = 'connecting';
      
      const instance = new SoblendBaileys(sessionInfo.config);
      this.instances.set(id, instance);

      const socket = await instance.connect(sessionInfo.authPath);
      
      sessionInfo.socket = socket;
      sessionInfo.status = 'connected';
      sessionInfo.connectedAt = Date.now();
      
      console.log(`✅ Session ${id} (${sessionInfo.name}) connected`);
      
      return socket;
    } catch (error: any) {
      sessionInfo.status = 'error';
      sessionInfo.lastError = error.message;
      throw error;
    }
  }

  async disconnectSession(id: string): Promise<void> {
    const sessionInfo = this.sessions.get(id);
    if (!sessionInfo) {
      throw new Error(`Session ${id} not found`);
    }

    if (sessionInfo.socket) {
      sessionInfo.socket.end(undefined);
      sessionInfo.socket = null;
    }

    sessionInfo.status = 'disconnected';
    this.instances.delete(id);
    
    console.log(`🔌 Session ${id} (${sessionInfo.name}) disconnected`);
  }

  deleteSession(id: string): void {
    if (this.sessions.has(id)) {
      this.disconnectSession(id);
      this.sessions.delete(id);
      console.log(`🗑️ Session ${id} deleted`);
    }
  }

  getSession(id: string): SessionInfo | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): SessionInfo[] {
    return Array.from(this.sessions.values());
  }

  getConnectedSessions(): SessionInfo[] {
    return this.getAllSessions().filter(s => s.status === 'connected');
  }

  async connectAll(): Promise<void> {
    const promises = Array.from(this.sessions.keys()).map(id => 
      this.connectSession(id).catch(error => {
        console.error(`Failed to connect session ${id}:`, error.message);
      })
    );
    await Promise.all(promises);
  }

  async disconnectAll(): Promise<void> {
    const promises = Array.from(this.sessions.keys()).map(id => 
      this.disconnectSession(id).catch(error => {
        console.error(`Failed to disconnect session ${id}:`, error.message);
      })
    );
    await Promise.all(promises);
  }

  getStats() {
    return {
      total: this.sessions.size,
      connected: this.getConnectedSessions().length,
      disconnected: this.getAllSessions().filter(s => s.status === 'disconnected').length,
      connecting: this.getAllSessions().filter(s => s.status === 'connecting').length,
      error: this.getAllSessions().filter(s => s.status === 'error').length,
    };
  }
}
