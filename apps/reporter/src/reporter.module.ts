import { Module } from '@nestjs/common';
import { ReporterController } from './reporter.controller';
import { ReporterService } from './reporter.service';

@Module({
  imports: [],
  controllers: [ReporterController],
  providers: [ReporterService],
})
export class ReporterModule {}
