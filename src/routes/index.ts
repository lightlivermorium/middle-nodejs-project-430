import type { Kysely } from 'kysely';

import type { Database } from '../database/schema.ts';
import type { RouteHandlers } from '../generated/fastify.gen.ts';
import { createCitiesHandlers } from './cities.ts';
import { healthHandlers } from './health.ts';

export const createRouteHandlers = (db: Kysely<Database>): RouteHandlers => ({
  ...healthHandlers,
  ...createCitiesHandlers(db),
});
