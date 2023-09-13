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

describe("iser routes", () => {
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

  test("Should be able to create a new user", async () => {
    await request(app.server)
      .post("/user")
      .send({ name: "Bruno Tetzner", bornAt: "2002-12-25" })
      .expect(204);
  });

  test("Users should be able to get their information", async () => {
    const bornAt = "2002-12-25";

    const createUserResponse = await request(app.server)
      .post("/user")
      .send({ name: "Bruno Tetzner", bornAt });

    const cookies = createUserResponse.get("Set-Cookie");

    const bornAtJsDate = new Date(bornAt).toISOString();
    const getUserResponse = await request(app.server)
      .get("/user/me")
      .set("Cookie", cookies);

    expect(getUserResponse.body).toEqual(
      expect.objectContaining({ name: "Bruno Tetzner", bornAt: bornAtJsDate })
    );
  });

  test("User should be able to delete your account", async () => {
    const createUserResponse = await request(app.server)
      .post("/user")
      .send({ name: "Bruno Tetzner", bornAt: "2002-12-25" });

    const cookies = createUserResponse.get("Set-Cookie");

    const getUserResponse = await request(app.server)
      .get("/user/me")
      .set("Cookie", cookies);

    const { id } = getUserResponse.body;
    await request(app.server)
      .delete(`/user/${id}`)
      .set("Cookie", cookies)
      .expect(204);
  });

  test("User should be able to get your scores", async () => {
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
    await request(app.server)
      .post("/meal")
      .send({
        name: "Almoço de domingo",
        description:
          "Feijão, arroz, batata frita, picanha, refrigerante e bolo de chocolate",
        withinTheDiet: false,
      })
      .set("Cookie", cookies);
    await request(app.server)
      .post("/meal")
      .send({
        name: "Almoço saudável",
        description: "Feijão, arroz, bife e sala1da",
        withinTheDiet: true,
      })
      .set("Cookie", cookies);
    await request(app.server)
      .post("/meal")
      .send({
        name: "Almoço saudável",
        description: "Feijão, arroz, bife e sala1da",
        withinTheDiet: true,
      })
      .set("Cookie", cookies);
    await request(app.server)
      .post("/meal")
      .send({
        name: "Almoço saudável",
        description: "Feijão, arroz, bife e sala1da",
        withinTheDiet: true,
      })
      .set("Cookie", cookies);
    await request(app.server)
      .post("/meal")
      .send({
        name: "Almoço de domingo",
        description:
          "Feijão, arroz, batata frita, picanha, refrigerante e bolo de chocolate",
        withinTheDiet: false,
      })
      .set("Cookie", cookies);

    const mealResponse = await request(app.server)
      .get("/user/me/scores")
      .set("Cookie", cookies);

    expect(mealResponse.body).toEqual(
      expect.objectContaining({
        numberOfHealthyFood: 4,
        numberOfNotHealthyFood: 2,
        maxHealthyMeals: 3,
      })
    );
  });

  test("User should be able to edit your account", async () => {
    const createUserResponse = await request(app.server)
      .post("/user")
      .send({ name: "Bruno Tetzner", bornAt: "2002-12-25" })
      .expect(204);

    const cookies = createUserResponse.get("Set-Cookie");

    const getUserResponse = await request(app.server)
      .get("/user/me")
      .set("Cookie", cookies);

    console.log(getUserResponse.body.id, ">>>>>>>>");
    const newName = "Bruno L. Tetzner";

    await request(app.server)
      .put(`/user/${getUserResponse.body.id}`)
      .send({ name: newName })
      .set("Cookie", cookies);

    const getEditedUserResponse = await request(app.server)
      .get("/user/me")
      .set("Cookie", cookies);

    const bornAtString = "2002-12-25";
    const bornAtJsDate = new Date(bornAtString).toISOString();

    expect(getEditedUserResponse.body).toEqual(
      expect.objectContaining({
        name: newName,
        bornAt: bornAtJsDate,
      })
    );
  });
});
