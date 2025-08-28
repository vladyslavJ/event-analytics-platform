import { Controller, Get } from '@nestjs/common';
import { FbCollectorService } from './fb-collector.service';

@Controller()
export class FbCollectorController {
  constructor(private readonly fbCollectorService: FbCollectorService) {}

  @Get()
  getHello(): string {
    return this.fbCollectorService.getHello();
  }
}
