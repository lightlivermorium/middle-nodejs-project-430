import { defineConfig } from 'kysely-ctl';

import { config } from './src/config.ts';
import { createDb } from './src/database/index.ts';

export default defineConfig({
  kysely: createDb(config),
  migrations: {
    migrationFolder: 'src/database/migrations',
  },
  seeds: {
    seedFolder: 'src/database/seeds',
  },
});
