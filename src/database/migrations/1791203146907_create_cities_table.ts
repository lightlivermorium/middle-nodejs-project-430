import { type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('cities')
    .addColumn('code', 'varchar(3)', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('country', 'text', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('cities').execute();
}
