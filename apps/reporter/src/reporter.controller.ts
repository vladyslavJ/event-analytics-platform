import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ReporterService } from './reporter.service';
import { GetEventsReportDto } from './dto/get-events-report.dto';
import { GetRevenueReportDto } from './dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from './dto/get-demographics-report.dto';

@Controller('reports')
export class ReporterController {
  constructor(private readonly reporterService: ReporterService) {}

  @Get('events')
  @HttpCode(HttpStatus.OK)
  getEventsReport(@Query() filters: GetEventsReportDto) {
    return this.reporterService.getEventsReport(filters);
  }

  @Get('revenue')
  @HttpCode(HttpStatus.OK)
  getRevenueReport(@Query() filters: GetRevenueReportDto) {
    return this.reporterService.getRevenueReport(filters);
  }

  @Get('demographics')
  @HttpCode(HttpStatus.OK)
  getDemographicsReport(@Query() filters: GetDemographicsReportDto) {
    return this.reporterService.getDemographicsReport(filters);
  }
}
