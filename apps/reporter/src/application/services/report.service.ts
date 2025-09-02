import { Injectable, Inject } from '@nestjs/common';
import type { ReportGeneratorInterface } from '../../domain/interfaces/report-generator.interface';
import type {
  EventsReportResult,
  RevenueReportResult,
  DemographicsReportResult,
} from '../../domain/interfaces/reports-repository.interface';
import { GetEventsReportDto } from '../../dto/get-events-report.dto';
import { GetRevenueReportDto } from '../../dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from '../../dto/get-demographics-report.dto';
import { ReporterDiTokens } from '../../infrastructure/di/reporter-di-tokens';
import type { ReportsMetricsServiceInterface } from 'libs/metrics/interfaces/reporter-metrics-service.interface';
import { MetricsDiTokens } from 'libs/metrics/di/metrics-di-tokens';

@Injectable()
export class ReportService {
  constructor(
    @Inject(ReporterDiTokens.REPORT_GENERATOR)
    private readonly reportGenerator: ReportGeneratorInterface,
    @Inject(MetricsDiTokens.REPORTER_METRICS_SERVICE)
    private readonly metricsService: ReportsMetricsServiceInterface,
  ) {}

  async getEventsReport(filters: GetEventsReportDto): Promise<EventsReportResult[]> {
    return this.metricsService.observeReportLatency('events', async () => {
      return this.reportGenerator.generateEventsReport(filters);
    });
  }

  async getRevenueReport(filters: GetRevenueReportDto): Promise<RevenueReportResult> {
    return this.metricsService.observeReportLatency('revenue', async () => {
      return this.reportGenerator.generateRevenueReport(filters);
    });
  }

  async getDemographicsReport(
    filters: GetDemographicsReportDto,
  ): Promise<DemographicsReportResult[]> {
    return this.metricsService.observeReportLatency('demographics', async () => {
      return this.reportGenerator.generateDemographicsReport(filters);
    });
  }
}
