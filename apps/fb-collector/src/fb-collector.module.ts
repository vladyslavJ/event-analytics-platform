import { Module } from '@nestjs/common';
import { FbCollectorController } from './fb-collector.controller';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaClientModule } from 'libs/prisma-client/src/prisma-client.module';
import { ConfigModule } from '@nestjs/config';
import { FbCollectorService } from './fb-collector.service';
import { FbEventsWorker } from './events/fb-events-worker.service';
import { NatsClientModule } from 'libs/nats/nats.module';
import { LoggerModule } from 'libs/logger/logger.module'
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
  ],
  controllers: [FbCollectorController],
  providers: [FbCollectorService, FbEventsWorker],
})
export class FbCollectorModule {}
