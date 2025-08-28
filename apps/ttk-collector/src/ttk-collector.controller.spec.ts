import { Test, TestingModule } from '@nestjs/testing';
import { TtkCollectorController } from './ttk-collector.controller';
import { TtkCollectorService } from './ttk-collector.service';

describe('TtkCollectorController', () => {
  let ttkCollectorController: TtkCollectorController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TtkCollectorController],
      providers: [TtkCollectorService],
    }).compile();

    ttkCollectorController = app.get<TtkCollectorController>(TtkCollectorController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(ttkCollectorController.getHello()).toBe('Hello World!');
    });
  });
});
