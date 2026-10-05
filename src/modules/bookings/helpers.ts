import { DatabaseError } from 'pg';

export const isCodeCollision = (error: unknown) =>
  error instanceof DatabaseError &&
  error.code === '23505' &&
  error.constraint === 'bookings_code_key';
