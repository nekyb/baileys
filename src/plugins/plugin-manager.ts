import { Plugin, SoblendSocket } from '../types';

export class PluginManager {
  private plugins: Map<string, Plugin>;
  private socket: SoblendSocket | null = null;

  constructor() {
    this.plugins = new Map();
  }

  async registerPlugin(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }

    this.plugins.set(plugin.name, plugin);

    if (this.socket) {
      await plugin.init(this.socket);
    }
  }

  unregisterPlugin(name: string): boolean {
    return this.plugins.delete(name);
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  async initializeAll(socket: SoblendSocket): Promise<void> {
    this.socket = socket;
    for (const plugin of this.plugins.values()) {
      await plugin.init(socket);
    }
  }

  async onMessage(msg: any): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.onMessage) {
        await plugin.onMessage(msg);
      }
    }
  }

  async onCommand(command: string, args: string[], msg: any): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.onCommand) {
        await plugin.onCommand(command, args, msg);
      }
    }
  }
}
