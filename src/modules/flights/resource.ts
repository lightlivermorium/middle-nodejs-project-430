import type { Flight } from '../../generated/index.ts';
import type { FlightRow } from './types.ts';

const make = (flight: FlightRow): Flight => ({
  id: flight.id,
  flightNumber: flight.number,
  airline: flight.airline,
  origin: flight.origin,
  destination: flight.destination,
  departureAt: flight.departureAt.toISOString(),
  arrivalAt: flight.arrivalAt.toISOString(),
  durationMinutes: flight.durationMinutes,
  price: { amount: flight.price, currency: 'RUB' },
  seatsAvailable: flight.seatsAvailable,
});

export const FlightResource = {
  make,
  collection: (flights: FlightRow[]) => flights.map(make),
};
