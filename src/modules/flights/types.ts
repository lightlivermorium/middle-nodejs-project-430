import type { Selectable } from 'kysely';

import type { FlightsTable } from '../../database/schema.ts';
import type { Flight } from '../../generated/index.ts';

export type FlightRow = Selectable<FlightsTable> &
  Pick<Flight, 'airline' | 'origin' | 'destination'>;
