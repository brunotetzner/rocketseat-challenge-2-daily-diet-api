import {
  afterAll,
  beforeAll,
  test,
  describe,
  expect,
  beforeEach,
} from "vitest";
import { execSync } from "node:child_process";
import { app } from "../app";
import request from "supertest";

describe("Meal routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  test("Should be able to create a meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/user")
      .send({ name: "Bruno Tetzner", bornAt: "2002-12-25" });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meal")
      .send({
        name: "Almoço saudável",
        description: "Feijão, arroz, bife e sala1da",
        withinTheDiet: true,
      })
      .set("Cookie", cookies)
      .expect(204);
  });

  test("Should be able to get all the meals", async () => {
    const createUserResponse = await request(app.server)
      .post("/user")
      .send({ name: "Bruno Tetzner", bornAt: "2002-12-25" });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meal")
      .send({
        name: "Almoço saudável",
        description: "Feijão, arroz, bife e sala1da",
        withinTheDiet: true,
      })
      .set("Cookie", cookies);

    const listMealsResponse = await request(app.server)
      .get(`/meal`)
      .set("Cookie", cookies);
    expect(listMealsResponse.body[0]).toEqual(
      expect.objectContaining({ name: "Almoço saudável" })
    );
  });

  test("Should be able to get one meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/user")
      .send({ name: "Bruno Tetzner", bornAt: "2002-12-25" });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meal")
      .send({
        name: "Almoço saudável",
        description: "Feijão, arroz, bife e sala1da",
        withinTheDiet: true,
      })
      .set("Cookie", cookies);

    const listMealsResponse = await request(app.server)
      .get(`/meal`)
      .set("Cookie", cookies);

    const mealId = listMealsResponse.body[0].id;

    const getOneMealResponse = await request(app.server)
      .get(`/meal/${mealId}`)
      .set("Cookie", cookies);
    expect(getOneMealResponse.body).toEqual(
      expect.objectContaining({ name: "Almoço saudável" })
    );
  });
  test("Should be able to edit a meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/user")
      .send({ name: "Bruno Tetzner", bornAt: "2002-12-25" });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meal")
      .send({
        name: "Almoço saudável",
        description: "Feijão, arroz, bife e sala1da",
        withinTheDiet: true,
      })
      .set("Cookie", cookies);

    const listMealsResponse = await request(app.server)
      .get(`/meal`)
      .set("Cookie", cookies);

    const mealId = listMealsResponse.body[0].id;

    await request(app.server)
      .put(`/meal/${mealId}`)
      .send({ name: "Almoço saudável editado :D" })
      .set("Cookie", cookies);

    const getEditedMeal = await request(app.server)
      .get(`/meal/${mealId}`)
      .set("Cookie", cookies);
    console.log(getEditedMeal.body);
    expect(getEditedMeal.body).toEqual(
      expect.objectContaining({ name: "Almoço saudável editado :D" })
    );
  });
  test("Should be able to delete a meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/user")
      .send({ name: "Bruno Tetzner", bornAt: "2002-12-25" });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meal")
      .send({
        name: "Almoço saudável",
        description: "Feijão, arroz, bife e sala1da",
        withinTheDiet: true,
      })
      .set("Cookie", cookies);

    const listMealsResponse = await request(app.server)
      .get(`/meal`)
      .set("Cookie", cookies);

    const mealId = listMealsResponse.body[0].id;

    await request(app.server)
      .delete(`/meal/${mealId}`)
      .set("Cookie", cookies)
      .expect(204);
  });
});
