import pino, { type Logger } from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const baseLogger = pino({
  level: isDev ? 'debug' : 'info',
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: 'cezar12-api',
    env: process.env.NODE_ENV ?? 'development',
  },
  redact: {
    paths: [
      'password',
      'password_hash',
      'token',
      'access_token',
      'refresh_token',
      'api_key',
      'secret',
      '*.password',
      '*.password_hash',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
});

export function createLogger(context: string): Logger {
  return baseLogger.child({ context });
}

export { baseLogger as logger };
