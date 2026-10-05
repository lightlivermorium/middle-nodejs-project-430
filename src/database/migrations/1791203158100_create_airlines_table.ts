import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('airlines')
    .addColumn('code', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('airlines').execute();
}
