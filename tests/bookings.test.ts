import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';

import { createApp } from '../src/app.ts';
import { createDb } from '../src/database/index.ts';
import { createFlight } from './helpers.ts';

const db = createDb(inject('databaseUrl'));
let app: FastifyInstance;

beforeAll(async () => {
  app = await createApp({ db, logger: false });
});

afterAll(async () => {
  await app.close();
  await db.destroy();
});

const contact = { email: 'ivan@example.com', phone: '+79991234567' };
const ivan = {
  firstName: 'Иван',
  lastName: 'Петров',
  dateOfBirth: '1990-05-20',
  documentNumber: '1',
};
const maria = {
  firstName: 'Мария',
  lastName: 'Петрова',
  dateOfBirth: '1992-11-03',
  documentNumber: '4509 123456',
};

const createBooking = (payload: object) =>
  app.inject({ method: 'POST', url: '/api/bookings', payload });

describe('POST /api/bookings', () => {
  it('creates a confirmed booking for one passenger', async () => {
    const flight = await createFlight(db);
    const flightResponse = await app.inject({ method: 'GET', url: `/api/flights/${flight.id}` });

    const response = await createBooking({ flightId: flight.id, contact, passengers: [ivan] });

    expect(response.statusCode).toBe(201);
    const booking = response.json();
    expect(booking).toMatchObject({
      status: 'confirmed',
      flight: flightResponse.json(),
      passengers: [ivan],
      contact,
      totalPrice: { amount: 5400, currency: 'RUB' },
    });
    expect(booking.code).toMatch(/^[A-Z0-9]{6}$/);
    expect(Date.now() - Date.parse(booking.createdAt)).toBeLessThan(60_000);

    const passengers = await db
      .selectFrom('passengers')
      .innerJoin('bookings', 'bookings.id', 'passengers.bookingId')
      .select('passengers.lastName')
      .where('bookings.code', '=', booking.code)
      .execute();
    expect(passengers).toEqual([{ lastName: 'Петров' }]);
  });

  it('multiplies the flight price by the number of passengers', async () => {
    const flight = await createFlight(db);

    const response = await createBooking({
      flightId: flight.id,
      contact,
      passengers: [ivan, maria],
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      passengers: [ivan, maria],
      totalPrice: { amount: 10_800, currency: 'RUB' },
    });
  });

  it('gives every booking its own code', async () => {
    const flight = await createFlight(db);
    const payload = { flightId: flight.id, contact, passengers: [ivan] };

    const first = await createBooking(payload);
    const second = await createBooking(payload);

    expect(first.json().code).not.toBe(second.json().code);
  });

  it.each([
    ['empty passengers', { passengers: [] }],
    ['unknown flight', { flightId: '00000000-0000-7000-8000-000000000000' }],
    ['non-uuid flight id', { flightId: 'fl_1' }],
  ])('responds 400 on %s', async (_, override) => {
    const flight = await createFlight(db);

    const response = await createBooking({
      flightId: flight.id,
      contact,
      passengers: [ivan],
      ...override,
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      code: 'validation_error',
      message: expect.any(String),
    });
  });
});

const bookFlight = async (passengers = [ivan]) => {
  const flight = await createFlight(db);
  const response = await createBooking({ flightId: flight.id, contact, passengers });
  return response.json();
};

const getBooking = (code: string, query = '') =>
  app.inject({ method: 'GET', url: `/api/bookings/${code}${query}` });

const cancelBooking = (code: string, payload?: object) =>
  app.inject({ method: 'POST', url: `/api/bookings/${code}/cancel`, payload });

describe('GET /api/bookings/{code}', () => {
  it('finds the booking by code and last name', async () => {
    const booking = await bookFlight();

    const response = await getBooking(booking.code, '?lastName=Петров');

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(booking);
  });

  it('ignores case and outer spaces in the last name and the code', async () => {
    const booking = await bookFlight();

    const response = await getBooking(
      booking.code.toLowerCase(),
      `?lastName=${encodeURIComponent('  пЕТРОВ ')}`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.json().code).toBe(booking.code);
  });

  it('accepts the last name of any passenger', async () => {
    const booking = await bookFlight([ivan, maria]);

    const response = await getBooking(booking.code, '?lastName=Петрова');

    expect(response.statusCode).toBe(200);
  });

  it('responds with the same 404 on wrong code, wrong last name and missing last name', async () => {
    const booking = await bookFlight();

    const responses = await Promise.all([
      getBooking('ZZZZZZ', '?lastName=Петров'),
      getBooking(booking.code, '?lastName=Сидоров'),
      getBooking(booking.code),
    ]);

    for (const response of responses) {
      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(responses[0].json());
    }
    expect(responses[0].json()).toMatchObject({ code: 'not_found' });
  });
});

describe('POST /api/bookings/{code}/cancel', () => {
  it('cancels the booking and returns it', async () => {
    const booking = await bookFlight();

    const response = await cancelBooking(booking.code, { lastName: 'петров' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ...booking, status: 'cancelled' });
    const found = await getBooking(booking.code, '?lastName=Петров');
    expect(found.json().status).toBe('cancelled');
  });

  it('allows cancelling twice', async () => {
    const booking = await bookFlight();

    await cancelBooking(booking.code, { lastName: 'Петров' });
    const response = await cancelBooking(booking.code, { lastName: 'Петров' });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe('cancelled');
  });

  it.each([
    ['wrong last name', { lastName: 'Сидоров' }],
    ['missing last name', {}],
    ['no body', undefined],
  ])('responds 404 on %s', async (_, payload) => {
    const booking = await bookFlight();

    const response = await cancelBooking(booking.code, payload);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: 'not_found' });
    const found = await getBooking(booking.code, '?lastName=Петров');
    expect(found.json().status).toBe('confirmed');
  });
});
