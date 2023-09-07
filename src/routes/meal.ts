import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";

export async function mealRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string().max(100),
      description: z.string(),
      withinTheDiet: z.boolean(),
    });
    let { sessionId } = request.cookies;
    if (!sessionId) {
      reply
        .code(400)
        .send({ err: "you`re need to make your signup to register a meal" });
    }

    const user = await knex("users").where({ session_id: sessionId }).first();
    const { name, description, withinTheDiet } = createMealBodySchema.parse(
      request.body
    );
    if (!user) {
      reply.code(404).send({ err: "user not found" });
    }

    const body = {
      id: randomUUID(),
      name,
      description,
      withinTheDiet,
      userId: user?.id,
    };
    await knex("meals").insert(body);

    return reply.status(204).send();
  });

  app.delete("/:id", async (request, reply) => {
    const getMealParamSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getMealParamSchema.parse(request.params);

    const meal = await knex("meals").where({ id }).first();

    if (!meal) {
      reply.code(404).send();
    }

    await knex("meals").where({ id }).delete();
    return reply.status(204).send();
  });

  app.get("/", async (request, reply) => {
    const { sessionId } = request.cookies;

    const user = await knex("users").where({ session_id: sessionId }).first();

    if (!user) reply.code(404).send();

    const meals = await knex("meals").where({ userId: user?.id });

    return meals || reply.code(404).send();
  });

  app.get("/:id", async (request, reply) => {
    const { sessionId } = request.cookies;

    const getMealParamSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getMealParamSchema.parse(request.params);

    const user = await knex("users").where({ session_id: sessionId }).first();
    const meal = await knex("meals")
      .where({ id, userId: user?.id })
      .first();

    return meal || reply.code(404).send();
  });

  app.put("/:id", async (request, reply) => {
    const updateMealBodySchema = z.object({
      name: z.string().max(100).optional(),
      description: z.string().optional(),
      withinTheDiet: z.boolean().optional(),
    });

    let { sessionId } = request.cookies;
    let { name, description, withinTheDiet } = updateMealBodySchema.parse(
      request.body
    );

    const getMealParamSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getMealParamSchema.parse(request.params);

    const body = {
      name,
      description,
      withinTheDiet,
    };
    const user = await knex("users").where({ session_id: sessionId }).first();
    if (!user) reply.status(404).send({ err: "user not found" });

    await knex("meals")
      .where({ id, userId: user?.id })
      .update(body);
    return reply.status(204).send();
  });
}
