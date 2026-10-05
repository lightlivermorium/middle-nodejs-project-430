import type { Insertable, Kysely } from 'kysely';

import type { CitiesTable, Database } from '../schema.ts';

const cities: Insertable<CitiesTable>[] = [
  { code: 'AMS', name: 'Амстердам', country: 'Нидерланды' },
  { code: 'ATH', name: 'Афины', country: 'Греция' },
  { code: 'BCN', name: 'Барселона', country: 'Испания' },
  { code: 'BER', name: 'Берлин', country: 'Германия' },
  { code: 'BRU', name: 'Брюссель', country: 'Бельгия' },
  { code: 'BUD', name: 'Будапешт', country: 'Венгрия' },
  { code: 'BUH', name: 'Бухарест', country: 'Румыния' },
  { code: 'CPH', name: 'Копенгаген', country: 'Дания' },
  { code: 'DUB', name: 'Дублин', country: 'Ирландия' },
  { code: 'FRA', name: 'Франкфурт-на-Майне', country: 'Германия' },
  { code: 'HEL', name: 'Хельсинки', country: 'Финляндия' },
  { code: 'KRK', name: 'Краков', country: 'Польша' },
  { code: 'LIS', name: 'Лиссабон', country: 'Португалия' },
  { code: 'LJU', name: 'Любляна', country: 'Словения' },
  { code: 'MAD', name: 'Мадрид', country: 'Испания' },
  { code: 'MIL', name: 'Милан', country: 'Италия' },
  { code: 'MUC', name: 'Мюнхен', country: 'Германия' },
  { code: 'NCE', name: 'Ницца', country: 'Франция' },
  { code: 'PAR', name: 'Париж', country: 'Франция' },
  { code: 'PRG', name: 'Прага', country: 'Чехия' },
  { code: 'RIX', name: 'Рига', country: 'Латвия' },
  { code: 'ROM', name: 'Рим', country: 'Италия' },
  { code: 'SOF', name: 'София', country: 'Болгария' },
  { code: 'STO', name: 'Стокгольм', country: 'Швеция' },
  { code: 'TLL', name: 'Таллин', country: 'Эстония' },
  { code: 'VCE', name: 'Венеция', country: 'Италия' },
  { code: 'VIE', name: 'Вена', country: 'Австрия' },
  { code: 'VNO', name: 'Вильнюс', country: 'Литва' },
  { code: 'WAW', name: 'Варшава', country: 'Польша' },
  { code: 'ZAG', name: 'Загреб', country: 'Хорватия' },
];

export async function seed(db: Kysely<Database>) {
  await db
    .insertInto('cities')
    .values(cities)
    .onConflict((oc) =>
      oc.column('code').doUpdateSet((eb) => ({
        name: eb.ref('excluded.name'),
        country: eb.ref('excluded.country'),
      })),
    )
    .execute();
}
