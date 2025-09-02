import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { json } from 'express';
import { ConfigService } from '@nestjs/config';
import { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  const logger = await app.resolve<LoggerInterface>(LoggerDiTokens.LOGGER);
  logger.setContext('GATEWAY');
  app.use(json({ limit: '50mb' }));
  app.enableShutdownHooks();
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('gateway.port');
  await app.listen(port);
}
bootstrap();
