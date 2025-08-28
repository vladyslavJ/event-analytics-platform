import { NestFactory } from '@nestjs/core';
import { TtkCollectorModule } from './ttk-collector.module';

async function bootstrap() {
  const app = await NestFactory.create(TtkCollectorModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
