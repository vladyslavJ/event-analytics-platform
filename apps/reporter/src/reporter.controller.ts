import { Controller, Get } from '@nestjs/common';
import { ReporterService } from './reporter.service';

@Controller()
export class ReporterController {
  constructor(private readonly reporterService: ReporterService) {}

  @Get()
  getHello(): string {
    return this.reporterService.getHello();
  }
}
