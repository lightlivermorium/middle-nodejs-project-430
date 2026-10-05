import { createApp } from './app.ts';
import { config } from './config.ts';
import { createDb } from './database/index.ts';
import { migrateToLatest } from './database/migrate.ts';
import { seedDatabase } from './database/seed.ts';

async function bootstrap() {
  const db = createDb(config.DATABASE_URL);

  await migrateToLatest(db);
  await seedDatabase(db);

  const app = await createApp({ db });

  app.addHook('onClose', async () => {
    await db.destroy();
  });

  await app.listen({
    port: config.PORT,
    host: '0.0.0.0',
  });

  const signals = ['SIGINT', 'SIGTERM'];

  for (const signal of signals) {
    process.on(signal, async () => {
      await app.close();
    });
  }
}

bootstrap();
