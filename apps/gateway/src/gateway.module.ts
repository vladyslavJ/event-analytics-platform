import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { NatsClientModule } from 'libs/nats/nats.module';
import { MetricsModule } from 'libs/metrics/metrics.module';
import { LoggerModule } from 'libs/logger/logger.module';
import { EventsController } from './presentation/controllers/events.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { EventProcessingService } from './application/services/event-processing.service';
import { EventProcessor } from './domain/services/event-processor.service';
import { ZodEventValidator } from './infrastructure/validators/zod-event.validator';
import { NatsEventPublisher } from './infrastructure/publishers/nats-event.publisher';
import { GatewayDiTokens } from './infrastructure/di/gateway-di-tokens';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TerminusModule,
    NatsClientModule,
    MetricsModule,
    LoggerModule,
  ],
  controllers: [EventsController, HealthController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    EventProcessingService,
    {
      provide: GatewayDiTokens.EVENT_PROCESSOR,
      useClass: EventProcessor,
    },
    {
      provide: GatewayDiTokens.EVENT_VALIDATOR,
      useClass: ZodEventValidator,
    },
    {
      provide: GatewayDiTokens.EVENT_PUBLISHER,
      useClass: NatsEventPublisher,
    },
  ],
})
export class GatewayModule {}
