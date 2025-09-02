import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaClientModule } from 'libs/prisma-client/src/prisma-client.module';
import { LoggerModule } from 'libs/logger/logger.module';
import { MetricsModule } from 'libs/metrics/metrics.module';
import configuration from 'libs/config/configuration';

// Presentation
import { ReportsController } from './presentation/controllers/reports.controller';
import { HealthController } from './presentation/controllers/health.controller';

// Application
import { ReportService } from './application/services/report.service';

// Domain
import { ReportGenerator } from './domain/services/report-generator.service';

// Infrastructure
import { PrismaReportsRepository } from './infrastructure/repositories/prisma-reports.repository';
import { PrismaQueryBuilder } from './infrastructure/query-builders/prisma-query-builder.service';
import { ReporterDiTokens } from './infrastructure/di/reporter-di-tokens';

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
  controllers: [ReportsController, HealthController],
  providers: [
    // Global validation pipe
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    // Application services
    ReportService,
    // Domain services
    {
      provide: ReporterDiTokens.REPORT_GENERATOR,
      useClass: ReportGenerator,
    },
    // Infrastructure services
    {
      provide: ReporterDiTokens.REPORTS_REPOSITORY,
      useClass: PrismaReportsRepository,
    },
    {
      provide: ReporterDiTokens.QUERY_BUILDER,
      useClass: PrismaQueryBuilder,
    },
  ],
})
export class ReporterRefactoredModule {}
