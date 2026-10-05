import type { Kysely } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { z } from 'zod';

import type { Database } from '../database/schema.ts';
import { DAY_MS } from '../dates.ts';
import { notFound } from '../errors.ts';
import type { RouteHandlers } from '../generated/fastify.gen.ts';
import { FlightResource } from '../resources/flight.ts';

const flightIdSchema = z.uuid();

const selectFlights = (db: Kysely<Database>) =>
  db
    .selectFrom('flights')
    .selectAll()
    .select((eb) => {
      const city = (code: 'flights.fromCityCode' | 'flights.toCityCode') =>
        jsonObjectFrom(
          eb
            .selectFrom('cities')
            .select(['cities.code', 'cities.name', 'cities.country'])
            .whereRef('cities.code', '=', code),
        ).$notNull();

      return [
        jsonObjectFrom(
          eb
            .selectFrom('airlines')
            .select(['airlines.code', 'airlines.name'])
            .whereRef('airlines.code', '=', 'flights.airlineCode'),
        )
          .$notNull()
          .as('airline'),
        city('flights.fromCityCode').as('origin'),
        city('flights.toCityCode').as('destination'),
      ];
    });

export const createFlightsHandlers = (
  db: Kysely<Database>,
): Pick<RouteHandlers, 'searchFlights' | 'getFlight'> => ({
  async searchFlights(request, reply) {
    const { origin, destination, date, passengers = 1 } = request.query;
    const dayStart = new Date(`${date}T00:00:00Z`);

    const rows = await selectFlights(db)
      .where('fromCityCode', '=', origin)
      .where('toCityCode', '=', destination)
      .where('departureAt', '>=', dayStart)
      .where('departureAt', '<', new Date(dayStart.getTime() + DAY_MS))
      .where('seatsAvailable', '>=', passengers)
      .orderBy('departureAt')
      .execute();

    return reply.code(200).send(FlightResource.collection(rows));
  },

  async getFlight(request, reply) {
    const { id } = request.params;
    const row = flightIdSchema.safeParse(id).success
      ? await selectFlights(db).where('id', '=', id).executeTakeFirst()
      : undefined;
    if (!row) {
      throw notFound('Рейс не найден');
    }

    return reply.code(200).send(FlightResource.make(row));
  },
});
