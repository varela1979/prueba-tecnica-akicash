import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("client").del();


    await knex("client").insert([
        { full_name: "Eduardo Jafet Varela Salinas", dni: '0511200500732', monthly_income: 22000 },
    ]);
};
