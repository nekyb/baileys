export { SoblendBaileys } from './core/connection';
export { SmartCache } from './utils/cache';
export { MediaCompressor } from './utils/compression';
export { logger, SoblendLogger } from './utils/logger';
export { AntiSpam } from './admin/anti-spam';
export { RateLimiter } from './admin/rate-limiter';
export { PluginManager } from './plugins/plugin-manager';
export { SoblendStorage } from './database/storage';
export { GroupAdminManager } from './group-admin/manager';
export { MicroserviceBridge } from './orchestration/service-bridge';
export { TaskQueue, Throttler } from './core/task-queue';
export { DashboardServer } from './dashboard/server';
export { MultiSessionManager } from './core/multi-session';
export { StatusCapture } from './features/status-capture';
export { DeletedMessageCapture } from './features/deleted-messages';
export { AutoReplySystem } from './features/auto-reply';
export * from './types';

export {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  jidDecode,
  jidNormalizedUser,
  areJidsSameUser,
  delay,
  Browsers,
  proto,
  WAProto
} from '@whiskeysockets/baileys';
