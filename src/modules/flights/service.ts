import type { Kysely } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

import type { Database } from '../../database/schema.ts';
import type { SearchFlightsData } from '../../generated/index.ts';
import { isFlightId, utcDayRange } from './helpers.ts';

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

export const searchFlights = (
  db: Kysely<Database>,
  { origin, destination, date, passengers = 1 }: SearchFlightsData['query'],
) => {
  const day = utcDayRange(date);

  return selectFlights(db)
    .where('fromCityCode', '=', origin)
    .where('toCityCode', '=', destination)
    .where('departureAt', '>=', day.start)
    .where('departureAt', '<', day.end)
    .where('seatsAvailable', '>=', passengers)
    .orderBy('departureAt')
    .execute();
};

export const findFlight = async (db: Kysely<Database>, id: string) =>
  isFlightId(id) ? selectFlights(db).where('id', '=', id).executeTakeFirst() : undefined;
