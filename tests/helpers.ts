import { randomInt } from 'node:crypto';

import type { Insertable, Kysely } from 'kysely';

import type { Database, FlightsTable } from '../src/database/schema.ts';
import { DAY_MS, toUtcDateString } from '../src/dates.ts';

export const daysFromToday = (days: number) =>
  toUtcDateString(new Date(Date.now() + days * DAY_MS));

export const createFlight = (
  db: Kysely<Database>,
  overrides: Partial<Insertable<FlightsTable>> = {},
) => {
  const departureAt = new Date(`${daysFromToday(40)}T10:00:00Z`);
  return db
    .insertInto('flights')
    .values({
      airlineCode: 'SU',
      number: `SU${randomInt(10_000, 100_000)}`,
      fromCityCode: 'KZN',
      toCityCode: 'KGD',
      departureAt,
      arrivalAt: new Date(departureAt.getTime() + 150 * 60 * 1000),
      durationMinutes: 150,
      price: 5400,
      seatsAvailable: 20,
      ...overrides,
    })
    .returning(['id', 'number'])
    .executeTakeFirstOrThrow();
};
