import { Injectable } from '@nestjs/common';

@Injectable()
export class FbCollectorService {
  getHello(): string {
    return 'Hello World!';
  }
}
