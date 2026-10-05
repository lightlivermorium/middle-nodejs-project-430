import type { RouteHandlers } from '../generated/fastify.gen.ts';

export const healthHandlers: Pick<RouteHandlers, 'health'> = {
  async health(_request, reply) {
    return reply.code(200).send({ status: 'ok' });
  },
};
