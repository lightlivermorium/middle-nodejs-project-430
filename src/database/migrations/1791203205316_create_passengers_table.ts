import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('passengers')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuidv7()`))
    .addColumn('booking_id', 'uuid', (col) =>
      col.notNull().references('bookings.id').onDelete('cascade'),
    )
    .addColumn('first_name', 'text', (col) => col.notNull())
    .addColumn('last_name', 'text', (col) => col.notNull())
    .addColumn('birth_date', 'date', (col) => col.notNull())
    .addColumn('document_number', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex('passengers_booking_id_idx')
    .on('passengers')
    .column('booking_id')
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('passengers').execute();
}
