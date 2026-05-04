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
  base: {
    service: 'cezar12-worker',
    env: process.env.NODE_ENV ?? 'development',
  },
  redact: {
    paths: ['password', 'token', 'api_key', 'secret', '*.token'],
    censor: '[REDACTED]',
  },
});

export function createLogger(context: string): Logger {
  return baseLogger.child({ context });
}
