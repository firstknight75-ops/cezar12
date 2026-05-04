import { FastifyInstance } from "fastify"
import authRoutes from "./auth.route"
import userRoutes from "./user.route"

export default async function routes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: "/auth" })
  app.register(userRoutes, { prefix: "/users" })
}
