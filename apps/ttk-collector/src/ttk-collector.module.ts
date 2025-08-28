import { Module } from '@nestjs/common';
import { TtkCollectorController } from './ttk-collector.controller';
import { TtkCollectorService } from './ttk-collector.service';

@Module({
  imports: [],
  controllers: [TtkCollectorController],
  providers: [TtkCollectorService],
})
export class TtkCollectorModule {}
