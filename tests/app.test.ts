import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';

import { createApp } from '../src/app.ts';
import { createDb } from '../src/database/index.ts';

let app: FastifyInstance;

beforeAll(async () => {
  const db = createDb(inject('databaseUrl'));
  app = await createApp({ db, logger: false });
  app.addHook('onClose', () => db.destroy());
});

afterAll(() => app.close());

describe('GET /api/health', () => {
  it('responds 200 with status ok', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});

describe('GET /api/cities', () => {
  it('responds 200 with Moscow and Saint Petersburg first', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/cities' });

    expect(response.statusCode).toBe(200);
    expect(response.json().map((city: { code: string }) => city.code)).toEqual([
      'MOW',
      'LED',
      'AER',
      'KZN',
      'SVX',
      'OVB',
      'KGD',
    ]);
    expect(response.json()[0]).toEqual({ code: 'MOW', name: 'Москва', country: 'Россия' });
  });
});

describe('unknown /api/ path', () => {
  it('responds 404 with a JSON error', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/unknown' });

    expect(response.statusCode).toBe(404);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.json()).toMatchObject({ code: 'not_found', message: expect.any(String) });
  });
});

describe('SPA-fallback', () => {
  it('serves the frontend page for a non-API path', async () => {
    const response = await app.inject({ method: 'GET', url: '/lookup' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);
    expect(response.body).toContain('<div id="root"></div>');
  });
});
