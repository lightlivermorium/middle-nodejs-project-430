import type { Booking } from '../../generated/index.ts';
import { FlightResource } from '../flights/resource.ts';
import type { BookingRow } from './types.ts';

const make = (booking: BookingRow): Booking => ({
  code: booking.code,
  status: booking.status,
  flight: FlightResource.make(booking.flight),
  passengers: booking.passengers.map((passenger) => ({
    firstName: passenger.firstName,
    lastName: passenger.lastName,
    dateOfBirth: passenger.birthDate,
    documentNumber: passenger.documentNumber,
  })),
  contact: { email: booking.contactEmail, phone: booking.contactPhone },
  totalPrice: { amount: booking.totalPrice, currency: 'RUB' },
  createdAt: booking.createdAt.toISOString(),
});

export const BookingResource = { make };
