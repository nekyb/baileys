"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.SoblendLogger = void 0;
const colors_1 = __importDefault(require("@imjxsx/colors"));
class SoblendLogger {
    static instance;
    startTime = Date.now();
    animationFrame = 0;
    constructor() { }
    static getInstance() {
        if (!SoblendLogger.instance) {
            SoblendLogger.instance = new SoblendLogger();
        }
        return SoblendLogger.instance;
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
    success(message) {
        const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
        console.log(colors_1.default.stylize(colors_1.default.styles.bright, colors_1.default.fg.green, `[${colors_1.default.stylize(colors_1.default.fg256(240), timestamp)}] ✅ ${colors_1.default.stylize(colors_1.default.fg.green, 'SUCCESS')}: ${message}`));
    }
    error(message) {
        const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
        console.log(colors_1.default.stylize(colors_1.default.styles.bright, colors_1.default.fg.red, `[${colors_1.default.stylize(colors_1.default.fg256(240), timestamp)}] ❌ ${colors_1.default.stylize(colors_1.default.fg.red, 'ERROR')}: ${message}`));
    }
    warning(message) {
        const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
        console.log(colors_1.default.stylize(colors_1.default.styles.bright, colors_1.default.fg.yellow, `[${colors_1.default.stylize(colors_1.default.fg256(240), timestamp)}] ⚠️  ${colors_1.default.stylize(colors_1.default.fg.yellow, 'WARNING')}: ${message}`));
    }
    info(message) {
        const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
        console.log(colors_1.default.stylize(colors_1.default.fg.cyan, `[${colors_1.default.stylize(colors_1.default.fg256(240), timestamp)}] ${colors_1.default.stylize(colors_1.default.fg.cyan, 'ℹ️  INFO')}: ${message}`));
    }
    debug(message) {
        const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
        console.log(colors_1.default.stylize(colors_1.default.fg256(240), `[${timestamp}] 🐛 DEBUG: ${message}`));
    }
    plugin(name, message) {
        const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
        console.log(colors_1.default.stylize(colors_1.default.fg256(141), colors_1.default.styles.bright, `[${colors_1.default.stylize(colors_1.default.fg256(240), timestamp)}] 🔌 ${colors_1.default.stylize(colors_1.default.fg256(165), 'PLUGIN')} [${colors_1.default.stylize(colors_1.default.fg256(201), name)}]: ${message}`));
    }
    connection(status, details) {
        const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
        let color = colors_1.default.fg.cyan;
        let icon = '🔗';
        let statusColor = colors_1.default.fg.cyan;
        if (status === 'connected') {
            color = colors_1.default.fg.green;
            statusColor = colors_1.default.fg256(46);
            icon = '✅';
        }
        else if (status === 'disconnected') {
            color = colors_1.default.fg.red;
            statusColor = colors_1.default.fg256(196);
            icon = '🔴';
        }
        else if (status === 'connecting') {
            color = colors_1.default.fg.yellow;
            statusColor = colors_1.default.fg256(226);
            icon = '🔄';
        }
        console.log(colors_1.default.stylize(colors_1.default.styles.bright, color, `[${colors_1.default.stylize(colors_1.default.fg256(240), timestamp)}] ${icon} ${colors_1.default.stylize(statusColor, 'CONNECTION')}: ${status.toUpperCase()}${details ? ' - ' + colors_1.default.stylize(colors_1.default.fg256(240), details) : ''}`));
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
        console.log(colors_1.default.stylize(color, `[${colors_1.default.stylize(colors_1.default.fg256(240), timestamp)}] ${arrow} ${colors_1.default.stylize(color, colors_1.default.styles.bright, typeLabel)} [${colors_1.default.stylize(colors_1.default.fg256(220), from.substring(0, 15))}]: ${colors_1.default.stylize(colors_1.default.fg256(255), text.substring(0, 50))}${text.length > 50 ? colors_1.default.stylize(colors_1.default.fg256(240), '...') : ''}`));
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
