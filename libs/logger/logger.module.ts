import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';
import { LoggerDiTokens } from './di/logger-di-tokens';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: LoggerDiTokens.LOGGER,
      useFactory: (configService: ConfigService) => {
        return new LoggerService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [LoggerDiTokens.LOGGER],
})
export class LoggerModule {}
