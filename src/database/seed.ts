import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { Kysely } from 'kysely';

import type { Database } from './schema.ts';

const seedFolder = path.resolve(import.meta.dirname, 'seeds');

export const seedDatabase = async (db: Kysely<Database>) => {
  const files = (await fs.readdir(seedFolder)).filter((file) => file.endsWith('.ts')).toSorted();
  for (const file of files) {
    const { seed } = await import(path.join(seedFolder, file));
    await seed(db);
  }
};
