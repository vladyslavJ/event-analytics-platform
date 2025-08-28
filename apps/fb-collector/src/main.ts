import { NestFactory } from '@nestjs/core';
import { FbCollectorModule } from './fb-collector.module';

async function bootstrap() {
  const app = await NestFactory.create(FbCollectorModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
