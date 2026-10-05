import type { Selectable } from 'kysely';

import type { FlightsTable } from '../database/schema.ts';
import type { Flight } from '../generated/index.ts';

type FlightRow = Selectable<FlightsTable> & Pick<Flight, 'airline' | 'origin' | 'destination'>;

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
