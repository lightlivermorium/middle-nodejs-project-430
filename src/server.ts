import { createApp } from './app.js';
import { config } from './config.js';

async function bootstrap() {
  const app = await createApp({});

  await app.ready();

  await app.listen({
    port: config.PORT,
    host: config.HOST,
  });

  const signals = ['SIGINT', 'SIGTERM'];

  for (const signal of signals) {
    process.on(signal, async () => {
      await app.close();
    });
  }
}

bootstrap();
