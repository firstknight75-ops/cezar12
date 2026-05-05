import type { FastifyInstance } from "fastify"
import { authRoutes } from "./auth.js"
import { projectsRoutes } from "./projects.js"
import { servicesRoutes } from "./services.js"
import { tokensRoutes } from "./tokens.js"
import { adminRoutes } from "./admin.js"

export default async function routes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: "/auth" })
  app.register(projectsRoutes, { prefix: "/projects" })
  app.register(servicesRoutes, { prefix: "/services" })
  app.register(tokensRoutes, { prefix: "/tokens" })
  app.register(adminRoutes, { prefix: "/admin" })
}
