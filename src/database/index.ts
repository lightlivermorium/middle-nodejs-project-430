import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import type { Config } from '../config.js';
import type { Database } from './schema.js';

export const createPool = (config: Config): Pool =>
  new Pool({
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_NAME,
    user: config.DB_USERNAME,
    password: config.DB_PASSWORD,
  });

export const createDb = (config: Config) =>
  new Kysely<Database>({
    dialect: new PostgresDialect({ pool: createPool(config) }),
    plugins: [new CamelCasePlugin()],
  });
