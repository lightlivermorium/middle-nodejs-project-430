import type { Kysely } from 'kysely';

import type { Database } from '../../database/schema.ts';
import { notFound } from '../../errors.ts';
import type { RouteHandlers } from '../../generated/fastify.gen.ts';
import { FlightResource } from './resource.ts';
import { findFlight, searchFlights } from './service.ts';

export const createFlightsHandlers = (
  db: Kysely<Database>,
): Pick<RouteHandlers, 'searchFlights' | 'getFlight'> => ({
  async searchFlights(request, reply) {
    const flights = await searchFlights(db, request.query);

    return reply.code(200).send(FlightResource.collection(flights));
  },

  async getFlight(request, reply) {
    const flight = await findFlight(db, request.params.id);
    if (!flight) {
      throw notFound('Рейс не найден');
    }

    return reply.code(200).send(FlightResource.make(flight));
  },
});
