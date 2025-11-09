"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.SoblendLogger = void 0;
const colors_1 = __importDefault(require("@imjxsx/colors"));
const colorette_1 = require("colorette");
class SoblendLogger {
    static instance;
    startTime = Date.now();
    animationFrame = 0;
    logLevel = 'info';
    constructor() { }
    static getInstance() {
        if (!SoblendLogger.instance) {
            SoblendLogger.instance = new SoblendLogger();
        }
        return SoblendLogger.instance;
    }
    setLogLevel(level) {
        this.logLevel = level;
    }
    shouldLog(level) {
        const levels = ['trace', 'debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.logLevel);
    }
    formatTimestamp() {
        return (0, colorette_1.gray)(`[${new Date().toLocaleTimeString('es-ES', { hour12: false })}]`);
    }
    printBanner() {
        console.clear();
        const gradient = [201, 165, 129, 93, 57, 21];
        const lines = [
            '╔═══════════════════════════════════════════════════════════════════════════╗',
            '║                                                                           ║',
            '║   ███████╗ ██████╗ ██████╗ ██╗     ███████╗███╗   ██╗██████╗             ║',
            '║   ██╔════╝██╔═══██╗██╔══██╗██║     ██╔════╝████╗  ██║██╔══██╗            ║',
            '║   ███████╗██║   ██║██████╔╝██║     █████╗  ██╔██╗ ██║██║  ██║            ║',
            '║   ╚════██║██║   ██║██╔══██╗██║     ██╔══╝  ██║╚██╗██║██║  ██║            ║',
            '║   ███████║╚██████╔╝██████╔╝███████╗███████╗██║ ╚████║██████╔╝            ║',
            '║   ╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═══╝╚═════╝             ║',
            '║                                                                           ║',
            '║              ██████╗  █████╗ ██╗██╗     ███████╗██╗   ██╗███████╗        ║',
            '║              ██╔══██╗██╔══██╗██║██║     ██╔════╝╚██╗ ██╔╝██╔════╝        ║',
            '║              ██████╔╝███████║██║██║     █████╗   ╚████╔╝ ███████╗        ║',
            '║              ██╔══██╗██╔══██║██║██║     ██╔══╝    ╚██╔╝  ╚════██║        ║',
            '║              ██████╔╝██║  ██║██║███████╗███████╗   ██║   ███████║        ║',
            '║              ╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝   ╚═╝   ╚══════╝        ║',
            '║                                                                           ║',
            '║                  🔥 THE ULTIMATE WHATSAPP MOD EXPERIENCE 🔥               ║',
            '║                                                                           ║',
            '╚═══════════════════════════════════════════════════════════════════════════╝',
        ];
        lines.forEach((line, i) => {
            const colorIndex = Math.floor((i / lines.length) * gradient.length);
            console.log(colors_1.default.stylize(colors_1.default.fg256(gradient[colorIndex]), colors_1.default.styles.bright, line));
        });
    }
    printFeatures() {
        console.log(colors_1.default.stylize(colors_1.default.fg256(51), colors_1.default.styles.bright, '\n⚡ CARACTERÍSTICAS LEGENDARIAS:\n'));
        const features = [
            { icon: '🚀', text: 'Multi-Sesión Simultánea', color: colors_1.default.fg256(46), desc: 'Múltiples cuentas al mismo tiempo' },
            { icon: '🎯', text: 'Botones & Listas Nativas', color: colors_1.default.fg256(51), desc: 'UI interactiva mejorada' },
            { icon: '🛡️', text: 'Anti-Spam Inteligente', color: colors_1.default.fg256(226), desc: 'Machine Learning para detección' },
            { icon: '💾', text: 'BSONLite Cifrado', color: colors_1.default.fg256(208), desc: 'Seguridad nivel empresarial' },
            { icon: '🎨', text: 'Dashboard Web Real-Time', color: colors_1.default.fg256(201), desc: 'Control total desde el navegador' },
            { icon: '📸', text: 'Captura de Estados', color: colors_1.default.fg256(141), desc: 'Descarga stories automáticamente' },
            { icon: '🎙️', text: 'Whisper AI Audio', color: colors_1.default.fg256(99), desc: 'Transcripción de voz a texto' },
            { icon: '🧠', text: 'MykloreJS Orchestra', color: colors_1.default.fg256(165), desc: 'Microservicios inteligentes' },
            { icon: '⚙️', text: 'Plugins Dinámicos', color: colors_1.default.fg256(214), desc: 'Hot-reload sin reiniciar' },
            { icon: '🔄', text: 'Auto-Reconnect Pro', color: colors_1.default.fg256(118), desc: 'Nunca pierde conexión' },
            { icon: '📊', text: 'Analytics Avanzado', color: colors_1.default.fg256(87), desc: 'Métricas en tiempo real' },
            { icon: '🗜️', text: 'Media Optimizer', color: colors_1.default.fg256(220), desc: 'Compresión inteligente' },
            { icon: '🎮', text: 'Sistema de Niveles', color: colors_1.default.fg256(198), desc: 'Gamificación completa' },
            { icon: '🔐', text: 'Encryption End-to-End', color: colors_1.default.fg256(160), desc: 'Privacidad total' },
            { icon: '⚡', text: 'Task Queue Pro', color: colors_1.default.fg256(190), desc: 'Procesamiento paralelo' },
            { icon: '🌐', text: 'REST API Built-in', color: colors_1.default.fg256(75), desc: 'Integración con cualquier app' },
        ];
        features.forEach(({ icon, text, color, desc }) => {
            console.log(colors_1.default.stylize(color, colors_1.default.styles.bright, `   ${icon}  ${text}`));
            console.log(colors_1.default.stylize(colors_1.default.fg256(240), `      └─ ${desc}`));
        });
    }
    trace(message) {
        if (!this.shouldLog('trace'))
            return;
        console.log(`${this.formatTimestamp()} ${(0, colorette_1.gray)('[ TRACE ]')} ${(0, colorette_1.dim)(message)}`);
    }
    debug(message) {
        if (!this.shouldLog('debug'))
            return;
        console.log(`${this.formatTimestamp()} ${(0, colorette_1.magenta)('[ DEBUG ]')} ${message}`);
    }
    info(message) {
        if (!this.shouldLog('info'))
            return;
        console.log(`${this.formatTimestamp()} ${(0, colorette_1.cyan)((0, colorette_1.bold)('[ INFO ]'))} ${(0, colorette_1.white)(message)}`);
    }
    success(message) {
        if (!this.shouldLog('info'))
            return;
        console.log(`${this.formatTimestamp()} ${(0, colorette_1.green)((0, colorette_1.bold)('[ SUCCESS ]'))} ${(0, colorette_1.white)(message)}`);
    }
    warning(message) {
        if (!this.shouldLog('warn'))
            return;
        console.log(`${this.formatTimestamp()} ${(0, colorette_1.yellow)((0, colorette_1.bold)('[ WARN ]'))} ${(0, colorette_1.white)(message)}`);
    }
    error(message, error) {
        if (!this.shouldLog('error'))
            return;
        console.error(`${this.formatTimestamp()} ${(0, colorette_1.red)((0, colorette_1.bold)('[ ERROR ]'))} ${(0, colorette_1.white)(message)}`);
        if (error && error.stack) {
            console.error((0, colorette_1.dim)(error.stack));
        }
    }
    connection(status, details) {
        if (!this.shouldLog('info'))
            return;
        const icons = {
            connected: '✅',
            disconnected: '🔴',
            connecting: '🔄',
            error: '❌'
        };
        const coloretteColors = {
            connected: colorette_1.green,
            disconnected: colorette_1.red,
            connecting: colorette_1.yellow,
            error: colorette_1.red
        };
        const icon = icons[status];
        const colorFn = coloretteColors[status];
        const message = details
            ? `${status.toUpperCase()} - ${(0, colorette_1.dim)(details)}`
            : status.toUpperCase();
        console.log(`${this.formatTimestamp()} ${icon} ${colorFn((0, colorette_1.bold)('[ CONNECTION ]'))} ${(0, colorette_1.white)(message)}`);
    }
    session(sessionId, action, status) {
        const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
        let color = colors_1.default.fg.cyan;
        let icon = 'ℹ️';
        if (status === 'success') {
            color = colors_1.default.fg256(46);
            icon = '✅';
        }
        else if (status === 'error') {
            color = colors_1.default.fg256(196);
            icon = '❌';
        }
        console.log(colors_1.default.stylize(colors_1.default.styles.bright, color, `[${colors_1.default.stylize(colors_1.default.fg256(240), timestamp)}] ${icon} ${colors_1.default.stylize(colors_1.default.fg256(165), 'SESSION')} [${colors_1.default.stylize(colors_1.default.fg256(201), sessionId)}]: ${action}`));
    }
    message(from, text, type = 'incoming') {
        const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
        const arrow = type === 'incoming' ? '📥' : '📤';
        const color = type === 'incoming' ? colors_1.default.fg256(51) : colors_1.default.fg256(141);
        const typeLabel = type === 'incoming' ? 'IN' : 'OUT';
        console.log(colors_1.default.stylize(color, `[${colors_1.default.stylize(colors_1.default.fg256(240), timestamp)}] ${arrow} ${colors_1.default.stylize(color, colors_1.default.styles.bright, typeLabel)} [${colors_1.default.stylize(colors_1.default.fg256(220), from.substring(0, 15))}] ${colors_1.default.stylize(colors_1.default.fg256(255), text.substring(0, 50))}${text.length > 50 ? colors_1.default.stylize(colors_1.default.fg256(240), '...') : ''}`));
    }
    stats(stats) {
        console.log('\n' + colors_1.default.stylize(colors_1.default.fg256(201), colors_1.default.styles.bright, '╔══════════════════════════════════════════════════════╗'));
        console.log(colors_1.default.stylize(colors_1.default.fg256(201), colors_1.default.styles.bright, '║           📊 ESTADÍSTICAS DEL SISTEMA              ║'));
        console.log(colors_1.default.stylize(colors_1.default.fg256(201), colors_1.default.styles.bright, '╚══════════════════════════════════════════════════════╝\n'));
        console.log(colors_1.default.stylize(colors_1.default.fg256(87), colors_1.default.styles.bright, `   ⏱️  Uptime:          ${colors_1.default.stylize(colors_1.default.fg256(255), this.formatUptime(Date.now() - this.startTime))}`));
        console.log(colors_1.default.stylize(colors_1.default.fg256(46), colors_1.default.styles.bright, `   💬 Mensajes:         ${colors_1.default.stylize(colors_1.default.fg256(255), stats.messageCount || 0)}`));
        console.log(colors_1.default.stylize(colors_1.default.fg256(226), colors_1.default.styles.bright, `   🚫 Spam Bloqueado:   ${colors_1.default.stylize(colors_1.default.fg256(255), stats.blockedSpam || 0)}`));
        console.log(colors_1.default.stylize(colors_1.default.fg256(201), colors_1.default.styles.bright, `   💾 Cache Hits:       ${colors_1.default.stylize(colors_1.default.fg256(255), stats.cacheHits || 0)}`));
        console.log(colors_1.default.stylize(colors_1.default.fg256(208), colors_1.default.styles.bright, `   📊 Hit Rate:         ${colors_1.default.stylize(colors_1.default.fg256(255), stats.cacheHits ? ((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100).toFixed(2) + '%' : '0%')}`));
    }
    table(title, data) {
        console.log('\n' + colors_1.default.stylize(colors_1.default.fg.cyan, colors_1.default.styles.bright, `╔═══ 📋 ${title.toUpperCase()} ${'═'.repeat(Math.max(0, 50 - title.length))}╗`));
        data.forEach(({ label, value }, index) => {
            const rowColor = index % 2 === 0 ? colors_1.default.fg256(255) : colors_1.default.fg256(250);
            const labelColor = colors_1.default.fg256(87);
            console.log(colors_1.default.stylize(colors_1.default.fg256(240), '║ ') +
                colors_1.default.stylize(labelColor, colors_1.default.styles.bright, label.padEnd(25)) +
                colors_1.default.stylize(colors_1.default.fg256(240), ' │ ') +
                colors_1.default.stylize(rowColor, String(value).padEnd(30)) +
                colors_1.default.stylize(colors_1.default.fg256(240), ' ║'));
        });
        console.log(colors_1.default.stylize(colors_1.default.fg.cyan, '╚' + '═'.repeat(62) + '╝\n'));
    }
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0)
            return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0)
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0)
            return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
    separator() {
        console.log(colors_1.default.stylize(colors_1.default.fg256(240), '\n' + '═'.repeat(80) + '\n'));
    }
    footer() {
        const footer = [
            '╔═══════════════════════════════════════════════════════════════════════════╗',
            '║                                                                           ║',
            '║                   💎 Powered by @soblend/baileys 💎                       ║',
            '║                  The Ultimate WhatsApp Bot Framework                     ║',
            '║                                                                           ║',
            '║                    Made with ❤️  by the Soblend Team                      ║',
            '║                                                                           ║',
            '║     🌟 Star us on GitHub  •  📖 Read the Docs  •  💬 Join Discord        ║',
            '║                                                                           ║',
            '╚═══════════════════════════════════════════════════════════════════════════╝',
        ];
        footer.forEach(line => {
            console.log(colors_1.default.stylize(colors_1.default.fg256(201), colors_1.default.styles.bright, line));
        });
    }
    loading(message) {
        const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        const frame = frames[this.animationFrame++ % frames.length];
        process.stdout.write(colors_1.default.stylize(colors_1.default.fg.cyan, `\r${frame} ${message}...`));
    }
    clearLoading() {
        process.stdout.write('\r\x1b[K');
    }
}
exports.SoblendLogger = SoblendLogger;
exports.logger = SoblendLogger.getInstance();
