import colors from '@imjxsx/colors';
import { bold, dim, gray, green, magenta, red, white, yellow, cyan } from 'colorette'; // Import colorette functions

export class SoblendLogger {
  private static instance: SoblendLogger;
  private startTime: number = Date.now();
  private animationFrame: number = 0;
  private logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error' = 'info'; // Default log level

  private constructor() {}

  static getInstance(): SoblendLogger {
    if (!SoblendLogger.instance) {
      SoblendLogger.instance = new SoblendLogger();
    }
    return SoblendLogger.instance;
  }

  // Method to set the log level
  setLogLevel(level: 'trace' | 'debug' | 'info' | 'warn' | 'error'): void {
    this.logLevel = level;
  }

  // Helper to check if a log message should be displayed
  private shouldLog(level: 'trace' | 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['trace', 'debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  // Helper to format timestamp
  private formatTimestamp(): string {
    return gray(`[${new Date().toLocaleTimeString('es-ES', { hour12: false })}]`);
  }

  printBanner(): void {
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
      console.log(colors.stylize(colors.fg256(gradient[colorIndex]), colors.styles.bright, line));
    });
  }

  printFeatures(): void {
    console.log(colors.stylize(colors.fg256(51), colors.styles.bright, '\n⚡ CARACTERÍSTICAS LEGENDARIAS:\n'));

    const features = [
      { icon: '🚀', text: 'Multi-Sesión Simultánea', color: colors.fg256(46), desc: 'Múltiples cuentas al mismo tiempo' },
      { icon: '🎯', text: 'Botones & Listas Nativas', color: colors.fg256(51), desc: 'UI interactiva mejorada' },
      { icon: '🛡️', text: 'Anti-Spam Inteligente', color: colors.fg256(226), desc: 'Machine Learning para detección' },
      { icon: '💾', text: 'BSONLite Cifrado', color: colors.fg256(208), desc: 'Seguridad nivel empresarial' },
      { icon: '🎨', text: 'Dashboard Web Real-Time', color: colors.fg256(201), desc: 'Control total desde el navegador' },
      { icon: '📸', text: 'Captura de Estados', color: colors.fg256(141), desc: 'Descarga stories automáticamente' },
      { icon: '🎙️', text: 'Whisper AI Audio', color: colors.fg256(99), desc: 'Transcripción de voz a texto' },
      { icon: '🧠', text: 'MykloreJS Orchestra', color: colors.fg256(165), desc: 'Microservicios inteligentes' },
      { icon: '⚙️', text: 'Plugins Dinámicos', color: colors.fg256(214), desc: 'Hot-reload sin reiniciar' },
      { icon: '🔄', text: 'Auto-Reconnect Pro', color: colors.fg256(118), desc: 'Nunca pierde conexión' },
      { icon: '📊', text: 'Analytics Avanzado', color: colors.fg256(87), desc: 'Métricas en tiempo real' },
      { icon: '🗜️', text: 'Media Optimizer', color: colors.fg256(220), desc: 'Compresión inteligente' },
      { icon: '🎮', text: 'Sistema de Niveles', color: colors.fg256(198), desc: 'Gamificación completa' },
      { icon: '🔐', text: 'Encryption End-to-End', color: colors.fg256(160), desc: 'Privacidad total' },
      { icon: '⚡', text: 'Task Queue Pro', color: colors.fg256(190), desc: 'Procesamiento paralelo' },
      { icon: '🌐', text: 'REST API Built-in', color: colors.fg256(75), desc: 'Integración con cualquier app' },
    ];

    features.forEach(({ icon, text, color, desc }) => {
      console.log(colors.stylize(color, colors.styles.bright, `   ${icon}  ${text}`));
      console.log(colors.stylize(colors.fg256(240), `      └─ ${desc}`));
    });
  }

  trace(message: string): void {
    if (!this.shouldLog('trace')) return;
    console.log(`${this.formatTimestamp()} ${gray('[ TRACE ]')} ${dim(message)}`);
  }

  debug(message: string): void {
    if (!this.shouldLog('debug')) return;
    console.log(`${this.formatTimestamp()} ${magenta('[ DEBUG ]')} ${message}`);
  }

  info(message: string): void {
    if (!this.shouldLog('info')) return;
    console.log(`${this.formatTimestamp()} ${cyan(bold('[ INFO ]'))} ${white(message)}`);
  }

  success(message: string): void {
    if (!this.shouldLog('info')) return;
    console.log(`${this.formatTimestamp()} ${green(bold('[ SUCCESS ]'))} ${white(message)}`);
  }

  warning(message: string): void {
    if (!this.shouldLog('warn')) return;
    console.log(`${this.formatTimestamp()} ${yellow(bold('[ WARN ]'))} ${white(message)}`);
  }

  error(message: string, error?: Error): void {
    if (!this.shouldLog('error')) return;
    console.error(`${this.formatTimestamp()} ${red(bold('[ ERROR ]'))} ${white(message)}`);
    if (error && error.stack) {
      console.error(dim(error.stack));
    }
  }

  connection(status: 'connected' | 'disconnected' | 'connecting' | 'error', details?: string): void {
    if (!this.shouldLog('info')) return;

    const icons = {
      connected: '✅',
      disconnected: '🔴',
      connecting: '🔄',
      error: '❌'
    };

    const coloretteColors = { // Renamed to avoid conflict with imported 'colors'
      connected: green,
      disconnected: red,
      connecting: yellow,
      error: red
    };

    const icon = icons[status];
    const colorFn = coloretteColors[status];

    const message = details
      ? `${status.toUpperCase()} - ${dim(details)}`
      : status.toUpperCase();

    console.log(
      `${this.formatTimestamp()} ${icon} ${colorFn(bold('[ CONNECTION ]'))} ${white(message)}`
    );
  }

  session(sessionId: string, action: string, status: 'success' | 'error' | 'info'): void {
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
    let color = colors.fg.cyan;
    let icon = 'ℹ️';

    if (status === 'success') {
      color = colors.fg256(46);
      icon = '✅';
    } else if (status === 'error') {
      color = colors.fg256(196);
      icon = '❌';
    }

    console.log(colors.stylize(
      colors.styles.bright,
      color,
      `[${colors.stylize(colors.fg256(240), timestamp)}] ${icon} ${colors.stylize(colors.fg256(165), 'SESSION')} [${colors.stylize(colors.fg256(201), sessionId)}]: ${action}`
    ));
  }

  message(from: string, text: string, type: 'incoming' | 'outgoing' = 'incoming'): void {
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
    const arrow = type === 'incoming' ? '📥' : '📤';
    const color = type === 'incoming' ? colors.fg256(51) : colors.fg256(141);
    const typeLabel = type === 'incoming' ? 'IN' : 'OUT';

    console.log(colors.stylize(
      color,
      `[${colors.stylize(colors.fg256(240), timestamp)}] ${arrow} ${colors.stylize(color, colors.styles.bright, typeLabel)} [${colors.stylize(colors.fg256(220), from.substring(0, 15))}] ${colors.stylize(colors.fg256(255), text.substring(0, 50))}${text.length > 50 ? colors.stylize(colors.fg256(240), '...') : ''}`
    ));
  }

  stats(stats: any): void {
    console.log('\n' + colors.stylize(colors.fg256(201), colors.styles.bright, '╔══════════════════════════════════════════════════════╗'));
    console.log(colors.stylize(colors.fg256(201), colors.styles.bright, '║           📊 ESTADÍSTICAS DEL SISTEMA              ║'));
    console.log(colors.stylize(colors.fg256(201), colors.styles.bright, '╚══════════════════════════════════════════════════════╝\n'));

    console.log(colors.stylize(colors.fg256(87), colors.styles.bright, `   ⏱️  Uptime:          ${colors.stylize(colors.fg256(255), this.formatUptime(Date.now() - this.startTime))}`));
    console.log(colors.stylize(colors.fg256(46), colors.styles.bright, `   💬 Mensajes:         ${colors.stylize(colors.fg256(255), stats.messageCount || 0)}`));
    console.log(colors.stylize(colors.fg256(226), colors.styles.bright, `   🚫 Spam Bloqueado:   ${colors.stylize(colors.fg256(255), stats.blockedSpam || 0)}`));
    console.log(colors.stylize(colors.fg256(201), colors.styles.bright, `   💾 Cache Hits:       ${colors.stylize(colors.fg256(255), stats.cacheHits || 0)}`));
    console.log(colors.stylize(colors.fg256(208), colors.styles.bright, `   📊 Hit Rate:         ${colors.stylize(colors.fg256(255), stats.cacheHits ? ((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100).toFixed(2) + '%' : '0%')}`));
  }

  table(title: string, data: Array<{ label: string; value: any }>): void {
    console.log('\n' + colors.stylize(colors.fg.cyan, colors.styles.bright, `╔═══ 📋 ${title.toUpperCase()} ${'═'.repeat(Math.max(0, 50 - title.length))}╗`));

    data.forEach(({ label, value }, index) => {
      const rowColor = index % 2 === 0 ? colors.fg256(255) : colors.fg256(250);
      const labelColor = colors.fg256(87);
      console.log(colors.stylize(colors.fg256(240), '║ ') +
        colors.stylize(labelColor, colors.styles.bright, label.padEnd(25)) +
        colors.stylize(colors.fg256(240), ' │ ') +
        colors.stylize(rowColor, String(value).padEnd(30)) +
        colors.stylize(colors.fg256(240), ' ║'));
    });

    console.log(colors.stylize(colors.fg.cyan, '╚' + '═'.repeat(62) + '╝\n'));
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  separator(): void {
    console.log(colors.stylize(colors.fg256(240), '\n' + '═'.repeat(80) + '\n'));
  }

  footer(): void {
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
      console.log(colors.stylize(colors.fg256(201), colors.styles.bright, line));
    });
  }

  loading(message: string): void {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const frame = frames[this.animationFrame++ % frames.length];
    process.stdout.write(colors.stylize(colors.fg.cyan, `\r${frame} ${message}...`));
  }

  clearLoading(): void {
    process.stdout.write('\r\x1b[K');
  }
}

export const logger = SoblendLogger.getInstance();