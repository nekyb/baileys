"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
class PluginManager {
    plugins;
    socket = null;
    constructor() {
        this.plugins = new Map();
    }
    async registerPlugin(plugin) {
        if (this.plugins.has(plugin.name)) {
            throw new Error(`Plugin ${plugin.name} is already registered`);
        }
        this.plugins.set(plugin.name, plugin);
        if (this.socket) {
            await plugin.init(this.socket);
        }
    }
    unregisterPlugin(name) {
        return this.plugins.delete(name);
    }
    getPlugin(name) {
        return this.plugins.get(name);
    }
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }
    async initializeAll(socket) {
        this.socket = socket;
        for (const plugin of this.plugins.values()) {
            await plugin.init(socket);
        }
    }
    async onMessage(msg) {
        for (const plugin of this.plugins.values()) {
            if (plugin.onMessage) {
                await plugin.onMessage(msg);
            }
        }
    }
    async onCommand(command, args, msg) {
        for (const plugin of this.plugins.values()) {
            if (plugin.onCommand) {
                await plugin.onCommand(command, args, msg);
            }
        }
    }
}
exports.PluginManager = PluginManager;
