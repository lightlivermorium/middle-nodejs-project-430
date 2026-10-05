import type { Kysely } from 'kysely';

import type { Database } from '../../database/schema.ts';
import { ValidationError } from '../../errors.ts';
import type { CreateBookingRequest } from '../../generated/index.ts';
import { generateCode } from '../../lib/code.ts';
import { findFlight } from '../flights/service.ts';
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
