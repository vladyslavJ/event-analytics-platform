import { GetEventsReportDto } from '../../dto/get-events-report.dto';
import { GetRevenueReportDto } from '../../dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from '../../dto/get-demographics-report.dto';
import type {
  EventsReportResult,
  RevenueReportResult,
  DemographicsReportResult,
} from './reports-repository.interface';

export interface ReportGeneratorInterface {
  generateEventsReport(filters: GetEventsReportDto): Promise<EventsReportResult[]>;
  generateRevenueReport(filters: GetRevenueReportDto): Promise<RevenueReportResult>;
  generateDemographicsReport(
    filters: GetDemographicsReportDto,
  ): Promise<DemographicsReportResult[]>;
}
