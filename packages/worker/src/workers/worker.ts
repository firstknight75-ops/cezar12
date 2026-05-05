import 'dotenv/config';
import { Worker, type Job } from 'bullmq';
import { Redis } from 'ioredis';
import { createLogger } from '../monitoring/logger.js';

const logger = createLogger('worker');

// ═══════════════════════════════════════════════════════════
// REDIS CONNECTION
// ═══════════════════════════════════════════════════════════

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // Required for BullMQ
  lazyConnect: true,
});

// ═══════════════════════════════════════════════════════════
// QUEUE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════

const QUEUE_CONFIGS = [
  { name: 'plan-generation',     concurrency: 3 },
  { name: 'content-generation',  concurrency: 3 },
  { name: 'image-processing',    concurrency: 5 },
  { name: 'report-analysis',     concurrency: 2 },
  { name: 'kitchen-analysis',    concurrency: 2 },
  { name: 'daily-recommendations', concurrency: 5 },
  { name: 'cleanup',             concurrency: 1 },
] as const;

// ═══════════════════════════════════════════════════════════
// WORKER INSTANCES
// ═══════════════════════════════════════════════════════════

const workers: Worker[] = [];

async function createWorkers(): Promise<void> {
  for (const config of QUEUE_CONFIGS) {
    const worker = new Worker(
      config.name,
      async (job: Job) => {
        logger.info(
          { queue: config.name, job_id: job.id, task_id: job.data?.task_id },
          'Processing job'
        );

        // TODO: Import and call JobProcessor.process(job) when built
        // const processor = new JobProcessor()
        // await processor.process(job)

        // Placeholder until JobProcessor is implemented
        logger.info(
          { queue: config.name, job_id: job.id },
          'Job processed (placeholder)'
        );
      },
      {
        connection: redis,
        concurrency: config.concurrency,
        limiter: {
          max: config.concurrency * 2,
          duration: 1000,
        },
      }
    );

    // ── Event Handlers ────────────────────────────────
    worker.on('completed', (job) => {
      logger.info(
        {
          queue: config.name,
          job_id: job.id,
          task_id: job.data?.task_id,
          duration_ms: Date.now() - job.timestamp,
        },
        'Job completed'
      );
    });

    worker.on('failed', (job, error) => {
      logger.error(
        {
          queue: config.name,
          job_id: job?.id,
          task_id: job?.data?.task_id,
          error: error.message,
          attempts: job?.attemptsMade,
        },
        'Job failed'
      );
    });

    worker.on('error', (error) => {
      logger.error(
        { queue: config.name, error: error.message },
        'Worker error'
      );
    });

    workers.push(worker);
    logger.info(
      { queue: config.name, concurrency: config.concurrency },
      'Worker started'
    );
  }
}

// ═══════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Shutting down workers...');

  // Close all workers (waits for current jobs to finish, max 30s)
  await Promise.all(
    workers.map((w) => w.close())
  );

  await redis.quit();
  logger.info('All workers stopped. Exiting.');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
  shutdown('uncaughtException');
});

// ═══════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════

async function start(): Promise<void> {
  try {
    await redis.connect();
    logger.info('Redis connected');

    await createWorkers();
    logger.info(
      { queues: QUEUE_CONFIGS.map((q) => q.name) },
      `${QUEUE_CONFIGS.length} workers running`
    );
  } catch (error) {
    logger.error({ error }, 'Failed to start workers');
    process.exit(1);
  }
}

start();
