import { GetEventsReportDto } from '../dto/get-events-report.dto';
import { GetRevenueReportDto } from '../dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from '../dto/get-demographics-report.dto';

export interface ReporterServiceInterface {
  getEventsReport(filters: GetEventsReportDto): Promise<unknown>;
  getRevenueReport(filters: GetRevenueReportDto): Promise<unknown>;
  getDemographicsReport(filters: GetDemographicsReportDto): Promise<unknown>;
}
