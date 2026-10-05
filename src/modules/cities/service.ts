import type { Kysely } from 'kysely';

import type { Database } from '../../database/schema.ts';

export const listCities = (db: Kysely<Database>) =>
  db.selectFrom('cities').select(['code', 'name', 'country']).orderBy('sortOrder').execute();
