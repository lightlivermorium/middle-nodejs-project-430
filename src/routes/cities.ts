import type { Kysely } from 'kysely';

import type { Database } from '../database/schema.ts';
import type { RouteHandlers } from '../generated/fastify.gen.ts';

export const createCitiesHandlers = (db: Kysely<Database>): Pick<RouteHandlers, 'listCities'> => ({
  async listCities(_request, reply) {
    const cities = await db
      .selectFrom('cities')
      .select(['code', 'name', 'country'])
      .orderBy('sortOrder')
      .execute();

    return reply.code(200).send(cities);
  },
});
