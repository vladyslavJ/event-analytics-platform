import { NestFactory } from '@nestjs/core';
import { TtkCollectorModule } from './ttk-collector.module';
import { ConfigService } from '@nestjs/config';
import { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';

async function bootstrap() {
  const app = await NestFactory.create(TtkCollectorModule);

  const logger = await app.resolve<LoggerInterface>(LoggerDiTokens.LOGGER);
  logger.setContext('TTK-COLLECTOR');

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('ttkCollector.port');
  await app.listen(port);
  logger.info(`Started on port: ${port}`);
}
bootstrap();
