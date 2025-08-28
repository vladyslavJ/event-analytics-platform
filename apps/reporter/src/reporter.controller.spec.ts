import { Test, TestingModule } from '@nestjs/testing';
import { ReporterController } from './reporter.controller';
import { ReporterService } from './reporter.service';

describe('ReporterController', () => {
  let reporterController: ReporterController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ReporterController],
      providers: [ReporterService],
    }).compile();

    reporterController = app.get<ReporterController>(ReporterController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(reporterController.getHello()).toBe('Hello World!');
    });
  });
});
