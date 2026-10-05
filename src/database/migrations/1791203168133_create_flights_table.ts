import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('flights')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuidv7()`))
    .addColumn('airline_code', 'varchar(2)', (col) => col.notNull().references('airlines.code'))
    .addColumn('number', 'text', (col) => col.notNull())
    .addColumn('from_city_code', 'varchar(3)', (col) => col.notNull().references('cities.code'))
    .addColumn('to_city_code', 'varchar(3)', (col) => col.notNull().references('cities.code'))
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
