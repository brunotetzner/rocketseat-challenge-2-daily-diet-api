import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string;
      name: string;
      bornAt: string;
      createdAt: string;
      session_id: string;
    };
    meals: {
      id: string;
      name: string;
      description: string;
      withinTheDiet: boolean;
      createdAt: string;
      userId: string;
      session_id?: string;
    };
  }
}
