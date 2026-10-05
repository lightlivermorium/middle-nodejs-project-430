import type { Kysely } from 'kysely';

import type { Database } from '../database/schema.ts';
import type { RouteHandlers } from '../generated/fastify.gen.ts';
import { createBookingsHandlers } from './bookings/routes.ts';
import { createCitiesHandlers } from './cities/routes.ts';
import { createFlightsHandlers } from './flights/routes.ts';
import { healthHandlers } from './health/routes.ts';

export const createRouteHandlers = (db: Kysely<Database>): Partial<RouteHandlers> => ({
  ...healthHandlers,
  ...createCitiesHandlers(db),
  ...createFlightsHandlers(db),
  ...createBookingsHandlers(db),
});
