import { table } from "console";
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('loan_application', (table) => {
        table.increments('id').primary();
        table.integer('client_id').unsigned().notNullable().references('id').inTable('client').onDelete('RESTRICT');
        table.decimal('requested_amount',12,2).notNullable();
        table.integer('term_months').unsigned().notNullable();
        table.enum('status',['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
        table.timestamp('created_at').defaultTo(knex.fn.now());

    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('loan_application');
}

