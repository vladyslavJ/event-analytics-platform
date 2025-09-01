import { NestFactory } from '@nestjs/core';
import { FbCollectorModule } from './fb-collector.module';
import { ConfigService } from '@nestjs/config';
import { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';

async function bootstrap() {
  const app = await NestFactory.create(FbCollectorModule);

  const logger = await app.resolve<LoggerInterface>(LoggerDiTokens.LOGGER);
  logger.setContext('FB-COLLECTOR');

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('fbCollector.port');

  await app.listen(port);
  logger.info(`FB Collector started on port: ${port}`);
}

bootstrap().catch(err => {
  console.error('Failed to start FB Collector:', err);
  process.exit(1);
});
