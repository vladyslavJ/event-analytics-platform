import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaClientModule } from 'libs/prisma-client/src/prisma-client.module';
import { LoggerModule } from 'libs/logger/logger.module';
import configuration from 'libs/config/configuration';
import { ReporterController } from './reporter.controller';
import { ReporterService } from './reporter.service';
import { ReportsQueryBuilder } from './reports-query.builder';
import { HealthController } from './health/health.controller';
import { MetricsModule } from 'libs/metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
    }),
    LoggerModule,
    PrismaClientModule,
    MetricsModule,
  ],
  controllers: [ReporterController, HealthController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    ReporterService,
    ReportsQueryBuilder,
  ],
})
export class ReporterModule {}
