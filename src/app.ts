import fastify from "fastify";
import { userRoutes } from "./routes/user";
import { mealRoutes } from "./routes/meal";
import cookie from "@fastify/cookie";

export const app = fastify();

app.register(cookie);

app.register(userRoutes, {
  prefix: "/user",
});

app.register(mealRoutes, {
  prefix: "/meal",
});
