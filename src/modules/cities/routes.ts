import type { Kysely } from 'kysely';

import type { Database } from '../../database/schema.ts';
import type { RouteHandlers } from '../../generated/fastify.gen.ts';
import { listCities } from './service.ts';

export const createCitiesHandlers = (db: Kysely<Database>): Pick<RouteHandlers, 'listCities'> => ({
  async listCities(_request, reply) {
    return reply.code(200).send(await listCities(db));
  },
});
