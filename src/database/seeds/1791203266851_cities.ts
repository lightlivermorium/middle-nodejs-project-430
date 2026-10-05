import type { Insertable, Kysely } from 'kysely';

import type { CitiesTable, Database } from '../schema.ts';

export const cities: Insertable<CitiesTable>[] = [
  { code: 'MOW', name: 'Москва', country: 'Россия', sortOrder: 1 },
  { code: 'LED', name: 'Санкт-Петербург', country: 'Россия', sortOrder: 2 },
  { code: 'AER', name: 'Сочи', country: 'Россия', sortOrder: 3 },
  { code: 'KZN', name: 'Казань', country: 'Россия', sortOrder: 4 },
  { code: 'SVX', name: 'Екатеринбург', country: 'Россия', sortOrder: 5 },
  { code: 'OVB', name: 'Новосибирск', country: 'Россия', sortOrder: 6 },
  { code: 'KGD', name: 'Калининград', country: 'Россия', sortOrder: 7 },
];

export async function seed(db: Kysely<Database>) {
  await db
    .insertInto('cities')
    .values(cities)
    .onConflict((oc) =>
      oc.column('code').doUpdateSet((eb) => ({
        name: eb.ref('excluded.name'),
        country: eb.ref('excluded.country'),
        sortOrder: eb.ref('excluded.sortOrder'),
      })),
    )
    .execute();
}
