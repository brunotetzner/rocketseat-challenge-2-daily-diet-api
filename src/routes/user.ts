import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";

export async function userRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string().max(100),
      bornAt: z.string(),
    });
    let { sessionId } = request.cookies;
    if (sessionId) {
      reply.code(400).send({ err: "you`re already registered" });
    }

    const { name, bornAt } = createUserBodySchema.parse(request.body);

    sessionId = randomUUID();

    reply.cookie("sessionId", sessionId, {
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 365, // 365 days
    });

    const bornAtJsDate = new Date(bornAt).toISOString();

    const body = {
      id: randomUUID(),
      name,
      bornAt: bornAtJsDate,
      session_id: sessionId,
    };
    await knex("users").insert(body);

    return reply.status(204).send();
  });

  app.delete("/:id", async (request, reply) => {
    let { sessionId } = request.cookies;

    const getTransactionParamSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getTransactionParamSchema.parse(request.params);

    const user = await knex("users")
      .where({ session_id: sessionId, id })
      .first();

    if (!user) {
      reply.code(404).send();
    }

    await knex("users").where({ session_id: sessionId, id }).delete();
    reply.clearCookie("sessionId");
    return reply.status(204).send();
  });

  app.get("/me", async (request, reply) => {
    const { sessionId } = request.cookies;

    const user = await knex("users").where({ session_id: sessionId }).first();

    return user || reply.code(404).send();
  });

  app.put("/:id", async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string().max(100).optional(),
      bornAt: z.string().optional(),
    });

    let { sessionId } = request.cookies;
    let { name, bornAt } = createUserBodySchema.parse(request.body);

    const getTransactionParamSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getTransactionParamSchema.parse(request.params);

    if (bornAt) {
      bornAt = new Date(bornAt).toISOString();
    }

    const body = {
      name,
      bornAt,
    };
    await knex("users").where({ session_id: sessionId, id }).update(body);

    return reply.status(201).send();
  });
}
