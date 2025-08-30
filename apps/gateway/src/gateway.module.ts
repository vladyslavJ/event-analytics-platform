import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health/health.controller';
import { NatsModule } from './nats/nats.module';
import { EventsModule } from './events/events.module';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

@Module({
  imports: [TerminusModule, HttpModule, NatsModule, EventsModule],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class GatewayModule {}
