import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaClientModule } from 'libs/prisma-client/src/prisma-client.module';
import { NatsClientModule } from 'libs/nats/nats.module';
import { LoggerModule } from 'libs/logger/logger.module';
import { MetricsModule } from 'libs/metrics/metrics.module';
import { HealthController } from './presentation/controllers/health.controller';
import { TiktokMessageConsumer } from './application/consumers/tiktok-message.consumer';
import { TiktokEventProcessor } from './domain/services/tiktok-event-processor.service';
import { EventRepository } from './infrastructure/repositories/event.repository';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { TtkCollectorDiTokens } from './infrastructure/di/ttk-events-di-tokens';
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
      provide: TtkCollectorDiTokens.TTK_EVENT_REPOSITORY,
      useClass: EventRepository,
    },
    {
      provide: TtkCollectorDiTokens.TTK_USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: TtkCollectorDiTokens.TTK_EVENT_PROCESSOR,
      useClass: TiktokEventProcessor,
    },
    TiktokMessageConsumer,
  ],
})
export class TtkCollectorModule {}
