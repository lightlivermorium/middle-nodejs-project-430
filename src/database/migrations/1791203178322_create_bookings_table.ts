import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('bookings')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedAlwaysAsIdentity())
    .addColumn('code', 'text', (col) => col.notNull().unique())
    .addColumn('flight_id', 'integer', (col) => col.notNull().references('flights.id'))
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('confirmed'))
    .addColumn('total_price', 'integer', (col) => col.notNull())
    .addColumn('contact_email', 'text', (col) => col.notNull())
    .addColumn('contact_phone', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('bookings').execute();
}
