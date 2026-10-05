import type { Kysely } from 'kysely';

import type { Database } from '../../database/schema.ts';
import { ValidationError } from '../../errors.ts';
import type { CreateBookingRequest } from '../../generated/index.ts';
import { generateCode } from '../../lib/code.ts';
import { findFlight, getFlight } from '../flights/service.ts';
import { isCodeCollision } from './helpers.ts';

export const createBooking = async (
  db: Kysely<Database>,
  { flightId, contact, passengers }: CreateBookingRequest,
) => {
  const flight = await findFlight(db, flightId);
  if (!flight) {
    throw new ValidationError('Рейс не найден');
  }

  const insertBooking = () =>
    db.transaction().execute(async (trx) => {
      const booking = await trx
        .insertInto('bookings')
        .values({
          code: generateCode(),
          flightId: flight.id,
          totalPrice: flight.price * passengers.length,
          contactEmail: contact.email,
          contactPhone: contact.phone,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      const createdPassengers = await trx
        .insertInto('passengers')
        .values(
          passengers.map((passenger) => ({
            bookingId: booking.id,
            firstName: passenger.firstName,
            lastName: passenger.lastName,
            birthDate: passenger.dateOfBirth,
            documentNumber: passenger.documentNumber,
          })),
        )
        .returningAll()
        .execute();

      return { ...booking, flight, passengers: createdPassengers };
    });

  try {
    return await insertBooking();
  } catch (error) {
    if (!isCodeCollision(error)) {
      throw error;
    }
    return insertBooking();
  }
};

export const findBooking = async (db: Kysely<Database>, code: string, lastName?: string) => {
  if (!lastName) {
    return undefined;
  }

  const booking = await db
    .selectFrom('bookings')
    .innerJoin('passengers', 'passengers.bookingId', 'bookings.id')
    .selectAll('bookings')
    .where('bookings.code', '=', code.trim().toUpperCase())
    .where((eb) =>
      eb(
        eb.fn('lower', [eb.fn('trim', ['passengers.lastName'])]),
        '=',
        eb.fn('lower', [eb.val(lastName.trim())]),
      ),
    )
    .executeTakeFirst();

  if (!booking) {
    return undefined;
  }

  const flight = await getFlight(db, booking.flightId);

  const passengers = await db
    .selectFrom('passengers')
    .selectAll()
    .where('bookingId', '=', booking.id)
    .orderBy('id')
    .execute();

  return { ...booking, flight, passengers };
};

export const cancelBooking = async (db: Kysely<Database>, code: string, lastName?: string) => {
  if (!lastName) {
    return undefined;
  }

  const found = await db
    .selectFrom('bookings')
    .innerJoin('passengers', 'passengers.bookingId', 'bookings.id')
    .select('bookings.id')
    .where('bookings.code', '=', code.trim().toUpperCase())
    .where((eb) =>
      eb(
        eb.fn('lower', [eb.fn('trim', ['passengers.lastName'])]),
        '=',
        eb.fn('lower', [eb.val(lastName.trim())]),
      ),
    )
    .executeTakeFirst();

  if (!found) {
    return undefined;
  }

  const booking = await db
    .updateTable('bookings')
    .set({ status: 'cancelled' })
    .where('id', '=', found.id)
    .returningAll()
    .executeTakeFirstOrThrow();

  const flight = await getFlight(db, booking.flightId);

  const passengers = await db
    .selectFrom('passengers')
    .selectAll()
    .where('bookingId', '=', booking.id)
    .orderBy('id')
    .execute();

  return { ...booking, flight, passengers };
};
