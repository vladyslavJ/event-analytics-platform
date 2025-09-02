import { Injectable, Inject } from '@nestjs/common';
import { GetEventsReportDto } from '../../dto/get-events-report.dto';
import { GetRevenueReportDto } from '../../dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from '../../dto/get-demographics-report.dto';
import type { ReportGeneratorInterface } from '../interfaces/report-generator.interface';
import type {
  ReportsRepositoryInterface,
  EventsReportResult,
  RevenueReportResult,
  DemographicsReportResult,
} from '../interfaces/reports-repository.interface';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import { ReporterDiTokens } from '../../infrastructure/di/reporter-di-tokens';

@Injectable()
export class ReportGenerator implements ReportGeneratorInterface {
  constructor(
    @Inject(ReporterDiTokens.REPORTS_REPOSITORY)
    private readonly reportsRepository: ReportsRepositoryInterface,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(ReportGenerator.name);
  }

  async generateEventsReport(filters: GetEventsReportDto): Promise<EventsReportResult[]> {
    this.logger.info(`Generating events report with filters: ${JSON.stringify(filters)}`);
    try {
      const result = await this.reportsRepository.getEventsReport(filters);
      this.logger.info(`Generated events report with ${result.length} groups`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to generate events report: ${error.message}`);
      throw error;
    }
  }

  async generateRevenueReport(filters: GetRevenueReportDto): Promise<RevenueReportResult> {
    this.logger.info(`Generating revenue report with filters: ${JSON.stringify(filters)}`);
    try {
      const result = await this.reportsRepository.getRevenueReport(filters);
      this.logger.info(`Generated revenue report with total revenue: ${result.totalRevenue}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to generate revenue report: ${error.message}`);
      throw error;
    }
  }

  async generateDemographicsReport(
    filters: GetDemographicsReportDto,
  ): Promise<DemographicsReportResult[]> {
    this.logger.info(`Generating demographics report with filters: ${JSON.stringify(filters)}`);
    try {
      const result = await this.reportsRepository.getDemographicsReport(filters);
      this.logger.info(`Generated demographics report with ${result.length} users`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to generate demographics report: ${error.message}`);
      throw error;
    }
  }
}
