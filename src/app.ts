import path from 'node:path';

import fastifyStatic from '@fastify/static';
import fastify, { type FastifyError } from 'fastify';
import openapiGlue from 'fastify-openapi-glue';
import type { Kysely } from 'kysely';

import type { Database } from './database/schema.ts';
import { ApiError, ValidationError, notFound } from './errors.ts';
import { createRouteHandlers } from './routes/index.ts';

const publicDir = path.resolve(import.meta.dirname, '../public');
const specification = path.resolve(import.meta.dirname, '../generated/openapi.yaml');

const FRAMEWORK_CODES: Record<number, string> = {
  400: 'validation_error',
  403: 'forbidden',
  404: 'not_found',
  405: 'method_not_allowed',
  415: 'validation_error',
};

type AppOptions = {
  db: Kysely<Database>;
  logger?: boolean;
};

export const createApp = async ({ db, logger = true }: AppOptions) => {
  const app = fastify({ logger });

  app.register(fastifyStatic, { root: publicDir });

  const serviceHandlers = createRouteHandlers(db);

  await app.register(openapiGlue, { specification, serviceHandlers });

  app.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith('/api/')) {
      throw notFound('Unknown endpoint');
    }

    return reply.sendFile('index.html');
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof ValidationError) {
      return reply.code(400).send({ code: 'validation_error', message: error.message });
    }

    if (error instanceof ApiError) {
      return reply.code(error.status).send({ code: error.code, message: error.message });
    }

    const status = error.statusCode ?? 500;
    if (status >= 400 && status < 500) {
      return reply
        .code(status)
        .send({ code: FRAMEWORK_CODES[status] ?? 'error', message: error.message });
    }

    request.log.error(error);
    return reply.code(500).send({ code: 'internal_error', message: 'Внутренняя ошибка сервера' });
  });

  return app;
};
