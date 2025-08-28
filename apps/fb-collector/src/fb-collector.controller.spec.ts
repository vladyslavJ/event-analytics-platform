import { Test, TestingModule } from '@nestjs/testing';
import { FbCollectorController } from './fb-collector.controller';
import { FbCollectorService } from './fb-collector.service';

describe('FbCollectorController', () => {
  let fbCollectorController: FbCollectorController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FbCollectorController],
      providers: [FbCollectorService],
    }).compile();

    fbCollectorController = app.get<FbCollectorController>(FbCollectorController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(fbCollectorController.getHello()).toBe('Hello World!');
    });
  });
});
