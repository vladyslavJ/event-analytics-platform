import { NestFactory } from '@nestjs/core';
import { FbCollectorModule } from './fb-collector.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(FbCollectorModule);
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('fbCollectorPort');

  await app.listen(process.env.port ?? 3010);
  console.log(`FB-Collector is running on port: ${port}`);
}
bootstrap();
