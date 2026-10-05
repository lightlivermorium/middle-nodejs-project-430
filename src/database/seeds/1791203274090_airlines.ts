import type { Insertable, Kysely } from 'kysely';

import type { AirlinesTable, Database } from '../schema.ts';

const airlines: Insertable<AirlinesTable>[] = [
  { code: 'AF', name: 'Air France' },
  { code: 'AY', name: 'Finnair' },
  { code: 'FR', name: 'Ryanair' },
  { code: 'IB', name: 'Iberia' },
  { code: 'KL', name: 'KLM' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'LO', name: 'LOT Polish Airlines' },
  { code: 'SK', name: 'SAS' },
  { code: 'TP', name: 'TAP Air Portugal' },
  { code: 'W6', name: 'Wizz Air' },
];

export async function seed(db: Kysely<Database>) {
  await db
    .insertInto('airlines')
    .values(airlines)
    .onConflict((oc) => oc.column('code').doUpdateSet((eb) => ({ name: eb.ref('excluded.name') })))
    .execute();
}
