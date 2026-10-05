import type { Kysely } from 'kysely';

import type { Database } from '../../database/schema.ts';
import type { RouteHandlers } from '../../generated/fastify.gen.ts';
import { BookingResource } from './resource.ts';
import { createBooking } from './service.ts';

export const createBookingsHandlers = (
  db: Kysely<Database>,
): Pick<RouteHandlers, 'createBooking'> => ({
  async createBooking(request, reply) {
    const booking = await createBooking(db, request.body);

    return reply.code(201).send(BookingResource.make(booking));
  },
});
