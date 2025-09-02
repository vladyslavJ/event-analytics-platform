import { GetEventsReportDto } from '../../dto/get-events-report.dto';
import { GetRevenueReportDto } from '../../dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from '../../dto/get-demographics-report.dto';

export interface QueryBuilderInterface {
  buildEventsReportQuery(filters: GetEventsReportDto): any;
  buildRevenueReportQuery(filters: GetRevenueReportDto): any;
  buildDemographicsReportQuery(filters: GetDemographicsReportDto): any;
}
