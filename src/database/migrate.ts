import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { Kysely } from 'kysely';
import { FileMigrationProvider, Migrator } from 'kysely/migration';

import type { Database } from './schema.ts';

const migrationFolder = path.resolve(import.meta.dirname, 'migrations');

export const migrateToLatest = async (db: Kysely<Database>) => {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({ fs, path, migrationFolder }),
  });
  const { error } = await migrator.migrateToLatest();
  if (error) {
    throw error;
  }
};
