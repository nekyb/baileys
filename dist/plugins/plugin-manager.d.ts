import { Plugin, SoblendSocket } from '../types';
export declare class PluginManager {
    private plugins;
    private socket;
    constructor();
    registerPlugin(plugin: Plugin): Promise<void>;
    unregisterPlugin(name: string): boolean;
    getPlugin(name: string): Plugin | undefined;
    getAllPlugins(): Plugin[];
    initializeAll(socket: SoblendSocket): Promise<void>;
    onMessage(msg: any): Promise<void>;
    onCommand(command: string, args: string[], msg: any): Promise<void>;
}
