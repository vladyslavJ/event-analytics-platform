import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { NatsModule } from '../nats/nats.module';
import { EventsServiceDiTokens } from 'libs/common/di/events-di-tokens';

@Module({
  imports: [NatsModule],
  controllers: [EventsController],
  providers: [
    {
      provide: EventsServiceDiTokens.EVENTS_SERVICE,
      useClass: EventsService,
    },
  ],
  exports: [EventsServiceDiTokens.EVENTS_SERVICE],
})
export class EventsModule {}
