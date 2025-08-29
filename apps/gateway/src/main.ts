import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.use(json({ limit: '50mb' }));
  app.enableShutdownHooks();
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
