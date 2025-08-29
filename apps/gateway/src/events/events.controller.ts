import { Controller, Post, Body, Logger } from '@nestjs/common';

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  @Post()
  handleEvents(@Body() payload: any) {
    this.logger.log('Received events:');
    this.logger.log(JSON.stringify(payload, null, 2));

    return { status: 'ok' };
  }
}
