import { FastifyInstance } from "fastify";

export async function mealRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return "meal";
  });
}
