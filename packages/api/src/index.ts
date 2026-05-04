import Fastify from "fastify"
import cors from "@fastify/cors"
import helmet from "@fastify/helmet"
import rateLimit from "@fastify/rate-limit"
import fp from "fastify-plugin"
import { authPlugin } from "./plugins/auth.js"
import { projectsRoutes } from "./routes/projects.js"
import { servicesRoutes } from "./routes/services.js"
import { tokensRoutes } from "./routes/tokens.js"
import { adminRoutes } from "./routes/admin.js"
import { redis } from "./db/redis.js"
import { injectDisclaimerIntoPayload } from "./lib/disclaimer.js"

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
    transport:
      process.env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
})

await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? "http://localhost:8080",
  credentials: true,
})

await app.register(helmet)

await app.register(rateLimit, {
  redis,
  keyGenerator: (req) => req.ip,
  max: 100,
  timeWindow: "1 minute",
  errorResponseBuilder: (_req, context) => ({
    error: "Too many requests",
    retryAfter: Math.ceil(context.ttl / 1000),
  }),
})

// Auth — skips routes with config.public
await app.register(authPlugin)

// Disclaimer injection for all AI result responses
app.addHook("preSerialization", async (_req, _reply, payload) => {
  return injectDisclaimerIntoPayload(payload)
})

// Routes
await app.register(fp(projectsRoutes), { prefix: "/api/projects" })
await app.register(fp(servicesRoutes), { prefix: "/api" })
await app.register(fp(tokensRoutes), { prefix: "/api/tokens" })
await app.register(fp(adminRoutes), { prefix: "/api/admin" })

// Health
app.get("/health", { config: { public: true } } as never, async () => ({
  status: "ok",
  ts: new Date().toISOString(),
  uptime: process.uptime(),
}))

// Start
const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? "0.0.0.0"

try {
  await app.listen({ port, host })
  app.log.info(`API listening on http://${host}:${port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
