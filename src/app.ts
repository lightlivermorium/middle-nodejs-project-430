import path from 'node:path';

import fastify, { type FastifyError } from 'fastify';
import openapiGlue from 'fastify-openapi-glue';

import type { RouteHandlers } from './generated/fastify.gen.js';

const specification = path.resolve(import.meta.dirname, '../generated/openapi.yaml');

export const createApp = async ({ logger = true }) => {
  const app = fastify({ logger });

  const serviceHandlers: RouteHandlers = {
    async health(_request, reply) {
      return reply.code(200).send({ status: 'ok' });
    },
  };

  await app.register(openapiGlue, { specification, serviceHandlers });

  app.setNotFoundHandler((_request, reply) =>
    reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Not found' } }),
  );

  app.setErrorHandler<FastifyError>((err, request, reply) => {
    if (err.validation) {
      return reply.code(400).send({
        error: { code: 'VALIDATION_ERROR', message: err.message, details: err.validation },
      });
    }
    request.log.error(err);
    return reply.code(500).send({ error: { code: 'INTERNAL', message: 'Internal server error' } });
  });

  return app;
};
