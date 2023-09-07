import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();
    table.string("name", 100).notNullable();
    table.timestamp("bornAt").notNullable();
    table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
  });

  await knex.schema.createTable("meal", (table) => {
    table.uuid("id").primary();
    table.string("name", 100).notNullable();
    table.text("description").notNullable();
    table.boolean("withinTheDiet").notNullable();
    table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
    table.uuid("userId").unsigned();
    table.foreign("userId").references("user.id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users");
  // await knex.schema.dropTable("meal");
}
