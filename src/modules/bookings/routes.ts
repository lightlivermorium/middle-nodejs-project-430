import type { Kysely } from 'kysely';

import type { Database } from '../../database/schema.ts';
import { ValidationError, notFound } from '../../errors.ts';
import type { RouteHandlers } from '../../generated/fastify.gen.ts';
import { BookingResource } from './resource.ts';
import { cancelBooking, createBooking, findBooking } from './service.ts';

export const createBookingsHandlers = (
  db: Kysely<Database>,
): Pick<RouteHandlers, 'createBooking' | 'getBooking' | 'cancelBooking'> => ({
  async createBooking(request, reply) {
    if (!request.body) {
      throw new ValidationError('Тело запроса обязательно');
    }

    const booking = await createBooking(db, request.body);

    return reply.code(201).send(BookingResource.make(booking));
  },

  async getBooking(request, reply) {
    const booking = await findBooking(db, request.params.code, request.query?.lastName);

    if (!booking) {
      throw notFound('Бронь не найдена');
    }

    return reply.code(200).send(BookingResource.make(booking));
  },

  async cancelBooking(request, reply) {
    const booking = await cancelBooking(db, request.params.code, request.body?.lastName);

    if (!booking) {
      throw notFound('Бронь не найдена');
    }

    return reply.code(200).send(BookingResource.make(booking));
  },
});
