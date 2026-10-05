import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('flights')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedAlwaysAsIdentity())
    .addColumn('airline_code', 'text', (col) => col.notNull().references('airlines.code'))
    .addColumn('number', 'text', (col) => col.notNull())
    .addColumn('from_city_code', 'text', (col) => col.notNull().references('cities.code'))
    .addColumn('to_city_code', 'text', (col) => col.notNull().references('cities.code'))
    .addColumn('departure_at', 'timestamptz', (col) => col.notNull())
    .addColumn('arrival_at', 'timestamptz', (col) => col.notNull())
    .addColumn('duration_minutes', 'integer', (col) => col.notNull())
    .addColumn('price', 'integer', (col) => col.notNull())
    .addColumn('seats_available', 'integer', (col) => col.notNull())
    .addUniqueConstraint('flights_number_departure_at_unique', ['number', 'departure_at'])
    .execute();

  await db.schema
    .createIndex('flights_search_idx')
    .on('flights')
    .columns(['from_city_code', 'to_city_code', 'departure_at'])
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('flights').execute();
}
