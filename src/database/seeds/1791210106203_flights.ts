import { faker } from '@faker-js/faker';
import { type Insertable, type Kysely, sql } from 'kysely';

import { DAY_MS, toUtcDateString } from '../../dates.ts';
import type { Database, FlightsTable } from '../schema.ts';
import { cities } from './1791203266851_cities.ts';
import { airlines } from './1791203274090_airlines.ts';

const DAYS_AHEAD = 30;

const DEPARTURE_HOURS = [9, 15];

const codes = cities.map((city) => city.code);
const routes = codes.flatMap((from) => codes.filter((to) => to !== from).map((to) => [from, to]));

const buildFlightsForDay = (day: Date): Insertable<FlightsTable>[] =>
  routes.flatMap(([fromCityCode, toCityCode], route) => {
    faker.seed(route);

    return DEPARTURE_HOURS.map((hour, slot) => {
      const airline = faker.helpers.arrayElement(airlines);
      const durationMinutes = faker.number.int({ min: 80, max: 280, multipleOf: 5 });
      const departureAt = new Date(day);
      departureAt.setUTCHours(hour);

      return {
        airlineCode: airline.code,
        number: `${airline.code}${1000 + route * DEPARTURE_HOURS.length + slot}`,
        fromCityCode,
        toCityCode,
        departureAt,
        arrivalAt: new Date(departureAt.getTime() + durationMinutes * 60 * 1000),
        durationMinutes,
        price: faker.number.int({ min: 3000, max: 8500, multipleOf: 100 }),
        seatsAvailable: faker.number.int({ min: 10, max: 90 }),
      };
    });
  });

export async function seed(db: Kysely<Database>) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => new Date(today.getTime() + i * DAY_MS));

  const seededDays = await db
    .selectFrom('flights')
    .select(sql<string>`(departure_at at time zone 'UTC')::date::text`.as('day'))
    .distinct()
    .where('departureAt', '>=', today)
    .where('departureAt', '<', new Date(today.getTime() + DAYS_AHEAD * DAY_MS))
    .execute();
  const seeded = new Set(seededDays.map((row) => row.day));

  const flights = days
    .filter((day) => !seeded.has(toUtcDateString(day)))
    .flatMap(buildFlightsForDay);

  if (flights.length > 0) {
    await db
      .insertInto('flights')
      .values(flights)
      .onConflict((oc) => oc.columns(['number', 'departureAt']).doNothing())
      .execute();
  }
}
