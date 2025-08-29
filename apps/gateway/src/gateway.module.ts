import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health/health.controller';
import { EventsController } from './events/events.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController, EventsController],
  providers: [],
})
export class GatewayModule {}
