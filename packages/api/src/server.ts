import 'dotenv/config';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { Redis } from 'ioredis';
import { createLogger } from './monitoring/logger.js';
import { checkDatabaseHealth, closeDatabase } from './db/index.js';

const logger = createLogger('server');

// ═══════════════════════════════════════════════════════════
// REDIS CONNECTION
// ═══════════════════════════════════════════════════════════

export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

// ═══════════════════════════════════════════════════════════
// FASTIFY INSTANCE
// ═══════════════════════════════════════════════════════════

export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: false, // we use Pino directly
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'request_id',
    genReqId: () => crypto.randomUUID(),
    trustProxy: process.env.NODE_ENV === 'production',
  });

  // ── Plugins ───────────────────────────────────────────
  await server.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  });

  await server.register(cors, {
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  await server.register(jwt, {
    secret: {
      private: Buffer.from(
        process.env.JWT_PRIVATE_KEY_BASE64 ?? '',
        'base64'
      ).toString('utf-8'),
      public: Buffer.from(
        process.env.JWT_PUBLIC_KEY_BASE64 ?? '',
        'base64'
      ).toString('utf-8'),
    },
    sign: { algorithm: 'RS256', expiresIn: '1h' },
    verify: { algorithms: ['RS256'] },
  });

  await server.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: '1 minute',
    redis: redis,
    keyGenerator: (request) =>
      request.headers['x-forwarded-for'] as string ?? request.ip,
  });

  await server.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5,
    },
  });

  // ── Request Logging Hook ──────────────────────────────
  server.addHook('onRequest', async (request) => {
    logger.info({
      request_id: request.id,
      method: request.method,
      url: request.url,
      ip: request.ip,
    }, 'Incoming request');
  });

  server.addHook('onResponse', async (request, reply) => {
    logger.info({
      request_id: request.id,
      method: request.method,
      url: request.url,
      status_code: reply.statusCode,
      duration_ms: reply.elapsedTime,
    }, 'Request completed');
  });

  // ── Global Error Handler ──────────────────────────────
  server.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode ?? 500;

    if (statusCode >= 500) {
      logger.error({
        request_id: request.id,
        error: error.message,
        stack: error.stack,
      }, 'Unhandled server error');
    }

    // Fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          user_message: 'البيانات المُرسلة غير صحيحة',
          details: error.validation,
        },
        meta: {
          request_id: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Rate limit errors
    if (statusCode === 429) {
      return reply.status(429).send({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          user_message: 'لقد تجاوزت الحد المسموح من الطلبات. الرجاء الانتظار.',
        },
        meta: {
          request_id: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return reply.status(statusCode).send({
      success: false,
      error: {
        code: (error as { code?: string }).code ?? 'INTERNAL_ERROR',
        message: error.message,
        user_message:
          statusCode >= 500
            ? 'حدث خطأ غير متوقع. الرجاء المحاولة لاحقاً.'
            : error.message,
      },
      meta: {
        request_id: request.id,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // ── Health Routes ─────────────────────────────────────
  server.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.0.1',
  }));

  server.get('/health/deep', async () => {
    const [dbHealth, redisHealth] = await Promise.allSettled([
      checkDatabaseHealth(),
      redis.ping().then(() => ({ status: 'connected', latencyMs: 0 })),
    ]);

    return {
      database:
        dbHealth.status === 'fulfilled'
          ? dbHealth.value
          : { status: 'error', message: 'Connection failed' },
      redis:
        redisHealth.status === 'fulfilled'
          ? redisHealth.value
          : { status: 'error', message: 'Connection failed' },
      timestamp: new Date().toISOString(),
    };
  });

  // ── Register Routes ───────────────────────────────────
  // TODO: Register route plugins here as they are built
  // await server.register(authRoutes, { prefix: '/auth' })
  // await server.register(projectRoutes, { prefix: '/projects' })
  // await server.register(serviceRoutes, { prefix: '/services' })
  // await server.register(restaurantRoutes, { prefix: '/restaurant' })

  return server;
}

// ═══════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════

async function start(): Promise<void> {
  const port = parseInt(process.env.API_PORT ?? '3001', 10);

  try {
    // Connect Redis
    await redis.connect();
    logger.info('Redis connected');

    // Build and start server
    const server = await buildServer();

    await server.listen({ port, host: '0.0.0.0' });
    logger.info({ port }, `API server running on port ${port}`);

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Shutting down...');
      await server.close();
      await redis.quit();
      await closeDatabase();
      logger.info('Shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

start();
