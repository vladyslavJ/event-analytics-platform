import { Controller, Get } from '@nestjs/common';
import { TtkCollectorService } from './ttk-collector.service';

@Controller()
export class TtkCollectorController {
  constructor(private readonly ttkCollectorService: TtkCollectorService) {}

  @Get()
  getHello(): string {
    return this.ttkCollectorService.getHello();
  }
}
