import { Module } from '@nestjs/common';
import { NatsService } from './nats.service';
import { NatsServiceDiTokens } from 'libs/common/di/nats-di-tokens';

@Module({
  providers: [
    {
      provide: NatsServiceDiTokens.NATS_SERVICE,
      useClass: NatsService,
    },
  ],
  exports: [NatsServiceDiTokens.NATS_SERVICE],
})
export class NatsModule {}
