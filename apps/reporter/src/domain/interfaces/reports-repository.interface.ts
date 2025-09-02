import { GetEventsReportDto } from '../../dto/get-events-report.dto';
import { GetRevenueReportDto } from '../../dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from '../../dto/get-demographics-report.dto';

export interface EventsReportResult {
  source: string;
  funnelStage: string;
  eventType: string;
  count: number;
}

export interface RevenueReportResult {
  totalRevenue: number;
  revenueByCampaign: Array<{
    campaignId: string;
    revenue: number;
  }>;
}

export interface DemographicsReportResult {
  sourceUserId: string;
  name?: string;
  age?: number;
  gender?: string;
  country?: string;
  city?: string;
  followers?: number;
}

export interface ReportsRepositoryInterface {
  getEventsReport(filters: GetEventsReportDto): Promise<EventsReportResult[]>;
  getRevenueReport(filters: GetRevenueReportDto): Promise<RevenueReportResult>;
  getDemographicsReport(filters: GetDemographicsReportDto): Promise<DemographicsReportResult[]>;
}
