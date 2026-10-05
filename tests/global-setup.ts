import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { TestProject } from 'vitest/node';

import { createDb } from '../src/database/index.ts';
import { migrateToLatest } from '../src/database/migrate.ts';
import { seedDatabase } from '../src/database/seed.ts';

declare module 'vitest' {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

export default async function setup(project: TestProject) {
  let databaseUrl = process.env.DATABASE_URL;
  let container: StartedPostgreSqlContainer | undefined;
  if (!databaseUrl) {
    container = await new PostgreSqlContainer('postgres:18.6-alpine').start();
    databaseUrl = container.getConnectionUri();
  }

  const db = createDb(databaseUrl);
  await migrateToLatest(db);
  await seedDatabase(db);
  await db.destroy();

  project.provide('databaseUrl', databaseUrl);

  return () => container?.stop();
}
