import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { Pool, types } from 'pg';

import type { Database } from './schema.ts';

types.setTypeParser(types.builtins.DATE, (value) => value);

export const createDb = (databaseUrl: string) =>
  new Kysely<Database>({
    dialect: new PostgresDialect({ pool: new Pool({ connectionString: databaseUrl }) }),
    plugins: [new CamelCasePlugin()],
  });
