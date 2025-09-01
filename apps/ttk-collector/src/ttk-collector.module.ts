import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

// Infrastructure
import { PrismaClientModule } from 'libs/prisma-client/src/prisma-client.module';
import { NatsClientModule } from 'libs/nats/nats.module';
import { LoggerModule } from 'libs/logger/logger.module';
import { MetricsModule } from 'libs/metrics/metrics.module';

// Presentation
import { HealthController } from './presentation/controllers/health.controller';

// Application
import {
  TiktokMessageConsumer,
  TIKTOK_EVENT_PROCESSOR_TOKEN,
} from './application/consumers/tiktok-message.consumer';

// Domain
import {
  TiktokEventProcessor,
  TTK_EVENT_REPOSITORY_TOKEN,
  TTK_USER_REPOSITORY_TOKEN,
} from './domain/services/tiktok-event-processor.service';

// Infrastructure
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
    // Repositories
    {
      provide: TTK_EVENT_REPOSITORY_TOKEN,
      useClass: EventRepository,
    },
    {
      provide: TTK_USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
    // Services
    {
      provide: TIKTOK_EVENT_PROCESSOR_TOKEN,
      useClass: TiktokEventProcessor,
    },
    // Consumers
    TiktokMessageConsumer,
  ],
})
export class TtkCollectorModule {}
