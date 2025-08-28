import { Injectable } from '@nestjs/common';

@Injectable()
export class TtkCollectorService {
  getHello(): string {
    return 'Hello World!';
  }
}
