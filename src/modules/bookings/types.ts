import type { Selectable } from 'kysely';

import type { BookingsTable, PassengersTable } from '../../database/schema.ts';
import type { FlightRow } from '../flights/types.ts';

export type BookingRow = Selectable<BookingsTable> & {
  flight: FlightRow;
  passengers: Selectable<PassengersTable>[];
};
