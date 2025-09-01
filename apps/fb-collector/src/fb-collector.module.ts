import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaClientModule } from 'libs/prisma-client/src/prisma-client.module';
import { NatsClientModule } from 'libs/nats/nats.module';
import { LoggerModule } from 'libs/logger/logger.module';
import { MetricsModule } from 'libs/metrics/metrics.module';
import { HealthController } from './presentation/controllers/health.controller';
import { FacebookMessageConsumer } from './application/consumers/facebook-message.consumer';
import { FacebookEventProcessor } from './domain/services/facebook-event-processor.service';
import { EventRepository } from './infrastructure/repositories/event.repository';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { FbCollectorDiTokens } from './infrastructure/di/fb-events-di-tokens';
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
      provide: FbCollectorDiTokens.FB_EVENT_REPOSITORY,
      useClass: EventRepository,
    },
    {
      provide: FbCollectorDiTokens.FB_USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: FbCollectorDiTokens.FACEBOOK_EVENT_PROCESSOR,
      useClass: FacebookEventProcessor,
    },
    FacebookMessageConsumer,
  ],
})
export class FbCollectorModule {}
