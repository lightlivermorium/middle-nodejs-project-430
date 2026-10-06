import process from 'node:process';

import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1),
});

export type Config = z.infer<typeof envSchema>;

export const config: Config = envSchema.parse(process.env);
