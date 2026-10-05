import SQLite from 'better-sqlite3';
import { CamelCasePlugin, Kysely, SqliteDialect } from 'kysely';

import type { Config } from '../config.ts';
import type { Database } from './schema.ts';

export const createDb = (config: Config) => {
  const sqlite = new SQLite(config.DATABASE_URL);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  return new Kysely<Database>({
    dialect: new SqliteDialect({ database: sqlite }),
    plugins: [new CamelCasePlugin()],
  });
};
