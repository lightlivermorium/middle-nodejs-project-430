import type { Insertable, Kysely } from 'kysely';

import type { AirlinesTable, Database } from '../schema.ts';

export const airlines: Insertable<AirlinesTable>[] = [
  { code: 'SU', name: 'Аэрофлот' },
  { code: 'DP', name: 'Победа' },
  { code: 'S7', name: 'S7 Airlines' },
  { code: 'U6', name: 'Уральские авиалинии' },
];

export async function seed(db: Kysely<Database>) {
  await db
    .insertInto('airlines')
    .values(airlines)
    .onConflict((oc) => oc.column('code').doUpdateSet((eb) => ({ name: eb.ref('excluded.name') })))
    .execute();
}
