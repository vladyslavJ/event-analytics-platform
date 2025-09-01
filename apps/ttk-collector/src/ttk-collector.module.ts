import { Module } from '@nestjs/common';
import { TtkCollectorController } from './ttk-collector.controller';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaClientModule } from 'libs/prisma-client/src/prisma-client.module';
import { ConfigModule } from '@nestjs/config';
import { TtkCollectorService } from './ttk-collector.service';
import { TtkEventsWorker } from './events/ttk-events-worker.service';
import { NatsClientModule } from 'libs/nats/nats.module';
import { LoggerModule } from 'libs/logger/logger.module';
import configuration from 'libs/config/configuration';
import { MetricsModule } from 'libs/metrics/metrics.module';

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
  controllers: [TtkCollectorController],
  providers: [TtkCollectorService, TtkEventsWorker],
})
export class TtkCollectorModule {}
