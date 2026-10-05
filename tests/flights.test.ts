import { randomInt } from 'node:crypto';

import type { FastifyInstance } from 'fastify';
import type { Insertable } from 'kysely';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';

import { createApp } from '../src/app.ts';
import { createDb } from '../src/database/index.ts';
import type { FlightsTable } from '../src/database/schema.ts';
import { DAY_MS, toUtcDateString } from '../src/dates.ts';

const db = createDb(inject('databaseUrl'));
let app: FastifyInstance;

beforeAll(async () => {
  app = await createApp({ db, logger: false });
});

afterAll(async () => {
  await app.close();
  await db.destroy();
});

const daysFromToday = (days: number) => toUtcDateString(new Date(Date.now() + days * DAY_MS));

const createFlight = (overrides: Partial<Insertable<FlightsTable>> = {}) => {
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

const search = (query: string) => app.inject({ method: 'GET', url: `/api/flights?${query}` });

const flightIds = (response: { json: () => { id: string }[] }) =>
  response.json().map((flight) => flight.id);

describe('GET /api/flights', () => {
  it('finds flights by route and date in the contract format', async () => {
    const date = daysFromToday(40);
    const flight = await createFlight();

    const response = await search(`origin=KZN&destination=KGD&date=${date}`);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toContainEqual({
      id: flight.id,
      flightNumber: flight.number,
      airline: { code: 'SU', name: 'Аэрофлот' },
      origin: { code: 'KZN', name: 'Казань', country: 'Россия' },
      destination: { code: 'KGD', name: 'Калининград', country: 'Россия' },
      departureAt: `${date}T10:00:00.000Z`,
      arrivalAt: `${date}T12:30:00.000Z`,
      durationMinutes: 150,
      price: { amount: 5400, currency: 'RUB' },
      seatsAvailable: 20,
    });
  });

  it('matches the departure day in UTC', async () => {
    const date = daysFromToday(41);
    const early = await createFlight({
      departureAt: `${date}T00:30:00Z`,
      arrivalAt: `${date}T03:00:00Z`,
    });
    const previousDay = await createFlight({
      departureAt: `${daysFromToday(40)}T23:30:00Z`,
      arrivalAt: `${date}T02:00:00Z`,
    });

    const response = await search(`origin=KZN&destination=KGD&date=${date}`);
    const ids = flightIds(response);

    expect(ids).toContain(early.id);
    expect(ids).not.toContain(previousDay.id);
  });

  it('skips flights without enough free seats', async () => {
    const date = daysFromToday(40);
    const flight = await createFlight({ seatsAvailable: 2 });

    const enough = await search(`origin=KZN&destination=KGD&date=${date}&passengers=2`);
    const notEnough = await search(`origin=KZN&destination=KGD&date=${date}&passengers=3`);

    expect(flightIds(enough)).toContain(flight.id);
    expect(flightIds(notEnough)).not.toContain(flight.id);
  });

  it('responds 200 with an empty list when nothing is found', async () => {
    const response = await search(`origin=MOW&destination=MOW&date=${daysFromToday(40)}`);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it.each([
    ['missing date', 'origin=MOW&destination=LED'],
    ['malformed date', 'origin=MOW&destination=LED&date=tomorrow'],
    ['zero passengers', `origin=MOW&destination=LED&date=${daysFromToday(40)}&passengers=0`],
    [
      'non-numeric passengers',
      `origin=MOW&destination=LED&date=${daysFromToday(40)}&passengers=two`,
    ],
  ])('responds 400 on %s', async (_, query) => {
    const response = await search(query);

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      code: 'validation_error',
      message: expect.any(String),
    });
  });
});

describe('GET /api/flights/{id}', () => {
  it('returns the same flight as the search', async () => {
    const date = daysFromToday(40);
    const flight = await createFlight();
    const found = (await search(`origin=KZN&destination=KGD&date=${date}`))
      .json()
      .find((f: { id: string }) => f.id === flight.id);

    const response = await app.inject({ method: 'GET', url: `/api/flights/${flight.id}` });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(found);
  });

  it.each(['NOPE', '1', '00000000-0000-7000-8000-000000000000'])(
    'responds 404 on unknown id %s',
    async (id) => {
      const response = await app.inject({ method: 'GET', url: `/api/flights/${id}` });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'not_found', message: expect.any(String) });
    },
  );
});
