import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { Kysely } from 'kysely';
import { FileMigrationProvider, Migrator } from 'kysely/migration';

import type { Database } from './schema.js';

const migrationFolder = path.resolve(import.meta.dirname, 'migrations');

export const migrateToLatest = async (db: Kysely<Database>) => {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({ fs, path, migrationFolder }),
  });
  const { error, results } = await migrator.migrateToLatest();
  for (const result of results ?? []) {
    if (result.status === 'Error') {
      console.error(`Migration "${result.migrationName}" failed`);
    }
  }
  if (error) {
    throw error;
  }
};
