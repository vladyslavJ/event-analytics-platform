import { Controller, Get, HttpCode, HttpStatus, Query, Inject } from '@nestjs/common';
import { ReportService } from '../../application/services/report.service';
import { GetEventsReportDto } from '../../dto/get-events-report.dto';
import { GetRevenueReportDto } from '../../dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from '../../dto/get-demographics-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportService: ReportService) {}

  @Get('events')
  @HttpCode(HttpStatus.OK)
  getEventsReport(@Query() filters: GetEventsReportDto) {
    return this.reportService.getEventsReport(filters);
  }

  @Get('revenue')
  @HttpCode(HttpStatus.OK)
  getRevenueReport(@Query() filters: GetRevenueReportDto) {
    return this.reportService.getRevenueReport(filters);
  }

  @Get('demographics')
  @HttpCode(HttpStatus.OK)
  getDemographicsReport(@Query() filters: GetDemographicsReportDto) {
    return this.reportService.getDemographicsReport(filters);
  }
}
