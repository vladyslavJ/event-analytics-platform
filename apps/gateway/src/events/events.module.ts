import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsServiceDiTokens } from 'libs/common/di/events-di-tokens';
import { LoggerModule } from 'libs/logger/logger.module';
import { NatsPublisherService } from 'libs/nats/nats-publisher.service';

@Module({
  imports: [LoggerModule],
  controllers: [EventsController],
  providers: [
    {
      provide: EventsServiceDiTokens.EVENTS_SERVICE,
      useClass: EventsService,
    },
    NatsPublisherService,
  ],
  exports: [EventsServiceDiTokens.EVENTS_SERVICE],
})
export class EventsModule {}
