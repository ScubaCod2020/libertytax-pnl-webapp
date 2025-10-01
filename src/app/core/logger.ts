// Lightweight browser logger with environment-aware levels
// Prefer using this over raw console.* in application code

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

function getDefaultLevel(): LogLevel {
  try {
    if (typeof window !== 'undefined') {
      // Allow runtime override via global for ad-hoc debugging
      const override = (window as any).__LOG_LEVEL__ as LogLevel | undefined;
      if (override) return override;
      // Heuristic: localhost or dev-like hosts -> debug; otherwise warn
      const host = window.location?.hostname ?? '';
      if (host === 'localhost' || host === '127.0.0.1') return 'debug';
    }
  } catch {}
  return 'warn';
}

const levelPriority: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

let currentLevel: LogLevel = getDefaultLevel();

export function setLogLevel(level: LogLevel) {
  currentLevel = level;
}

function isEnabled(target: LogLevel): boolean {
  return levelPriority[currentLevel] >= levelPriority[target];
}

export const logger = {
  debug: (...args: any[]) => {
    if (isEnabled('debug')) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  },
  info: (...args: any[]) => {
    if (isEnabled('info')) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isEnabled('warn')) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (isEnabled('error')) {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  },
  group: (...args: any[]) => {
    if (isEnabled('debug')) {
      // eslint-disable-next-line no-console
      console.group(...args);
    }
  },
  groupEnd: () => {
    if (isEnabled('debug')) {
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  },
};
