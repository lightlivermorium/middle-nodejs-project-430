import { CamelCasePlugin, PostgresDialect } from 'kysely';
import { defineConfig } from 'kysely-ctl';

import { config } from './src/config.js';
import { createPool } from './src/database/index.js';

export default defineConfig({
  dialect: new PostgresDialect({ pool: createPool(config) }),
  plugins: [new CamelCasePlugin()],
  migrations: {
    migrationFolder: 'src/database/migrations',
  },
  seeds: {
    seedFolder: 'src/database/seeds',
  },
});
