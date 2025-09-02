import { NestFactory } from '@nestjs/core';
import { ReporterModule } from './reporter.module';
import { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';

async function bootstrap() {
  const app = await NestFactory.create(ReporterModule);
  const logger = await app.resolve<LoggerInterface>(LoggerDiTokens.LOGGER);
  logger.setContext('REPORTER');
  app.enableShutdownHooks();
  await app.listen(process.env.REPORTER_PORT || 3001);
}
bootstrap();
