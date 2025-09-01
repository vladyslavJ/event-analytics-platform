import { Prisma } from '@prisma/client';
import { GetEventsReportDto } from '../dto/get-events-report.dto';
import { GetRevenueReportDto } from '../dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from '../dto/get-demographics-report.dto';

export interface ReportsQueryBuilderInterface {
  buildEventsReportQuery(filters: GetEventsReportDto): Prisma.EventGroupByArgs;
  buildRevenueReportQuery(filters: GetRevenueReportDto): Prisma.EventFindManyArgs;
  buildDemographicsReportQuery(filters: GetDemographicsReportDto): Prisma.UserFindManyArgs;
}
