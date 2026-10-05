import { z } from 'zod';

import { DAY_MS } from '../../dates.ts';

const flightIdSchema = z.uuid();

export const isFlightId = (value: string) => flightIdSchema.safeParse(value).success;

export const utcDayRange = (date: string) => {
  const start = new Date(`${date}T00:00:00Z`);
  return { start, end: new Date(start.getTime() + DAY_MS) };
};
