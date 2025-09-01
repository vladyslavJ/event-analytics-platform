import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaClientModule } from 'libs/prisma-client/src/prisma-client.module';
import { NatsClientModule } from 'libs/nats/nats.module';
import { LoggerModule } from 'libs/logger/logger.module';
import { MetricsModule } from 'libs/metrics/metrics.module';
import { HealthController } from './presentation/controllers/health.controller';
import { FacebookMessageConsumer, FACEBOOK_EVENT_PROCESSOR_TOKEN } from './application/consumers/facebook-message.consumer';
import { FacebookEventProcessor, FB_EVENT_REPOSITORY_TOKEN, FB_USER_REPOSITORY_TOKEN } from './domain/services/facebook-event-processor.service';
import { EventRepository } from './infrastructure/repositories/event.repository';
import { UserRepository } from './infrastructure/repositories/user.repository';

import configuration from 'libs/config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TerminusModule,
    PrismaClientModule,
    NatsClientModule,
    LoggerModule,
    MetricsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: FB_EVENT_REPOSITORY_TOKEN,
      useClass: EventRepository,
    },
    {
      provide: FB_USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
    {
      provide: FACEBOOK_EVENT_PROCESSOR_TOKEN,
      useClass: FacebookEventProcessor,
    },
    FacebookMessageConsumer,
  ],
})
export class FbCollectorModule {}
