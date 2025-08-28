import { Module } from '@nestjs/common';
import { FbCollectorController } from './fb-collector.controller';
import { FbCollectorService } from './fb-collector.service';

@Module({
  imports: [],
  controllers: [FbCollectorController],
  providers: [FbCollectorService],
})
export class FbCollectorModule {}
