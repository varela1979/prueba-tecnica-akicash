import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('installment', (table) => {
        table.increments('id').primary();
        table.integer('loan_application_id').unsigned().notNullable().references('id').inTable('loan_application').onDelete('RESTRICT');
        table.date('due_date').notNullable();
        table.decimal('amount',12,2).notNullable();
        table.boolean('paid').notNullable().defaultTo(false);
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('installment');
}

