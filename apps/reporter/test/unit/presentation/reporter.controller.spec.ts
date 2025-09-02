import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from '../../../src/presentation/controllers/reports.controller';
import { ReportService } from '../../../src/application/services/report.service';
import { GetEventsReportDto } from '../../../src/dto/get-events-report.dto';
import { GetRevenueReportDto } from '../../../src/dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from '../../../src/dto/get-demographics-report.dto';
import { EventSource } from 'libs/common/enums/event-source.enum';
import { FunnelStage } from 'libs/common/enums/funnel-stage.enum';
import { reporterFixtures } from '../../fixtures/reporter.fixture';

describe('ReportsController', () => {
  let controller: ReportsController;
  let mockReportService: jest.Mocked<ReportService>;

  beforeEach(async () => {
    const mockService: jest.Mocked<ReportService> = {
      getEventsReport: jest.fn(),
      getRevenueReport: jest.fn(),
      getDemographicsReport: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    mockReportService = module.get(ReportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEventsReport', () => {
    it('should return events report successfully', async () => {
      // Arrange
      const dto: GetEventsReportDto = reporterFixtures.eventsReportDto;
      const expectedResult = reporterFixtures.eventsReportResult;

      mockReportService.getEventsReport.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getEventsReport(dto);

      // Assert
      expect(mockReportService.getEventsReport).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle events report service errors', async () => {
      // Arrange
      const dto: GetEventsReportDto = reporterFixtures.eventsReportDto;
      const error = new Error('Service unavailable');

      mockReportService.getEventsReport.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getEventsReport(dto)).rejects.toThrow('Service unavailable');
      expect(mockReportService.getEventsReport).toHaveBeenCalledWith(dto);
    });

    it('should pass DTO validation to service layer', async () => {
      // Arrange
      const dto: GetEventsReportDto = {
        ...reporterFixtures.eventsReportDto,
        source: EventSource.Facebook,
        funnelStage: FunnelStage.Top,
      };

      mockReportService.getEventsReport.mockResolvedValue([]);

      // Act
      await controller.getEventsReport(dto);

      // Assert
      expect(mockReportService.getEventsReport).toHaveBeenCalledWith(dto);
      expect(mockReportService.getEventsReport).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no events found', async () => {
      // Arrange
      const dto: GetEventsReportDto = reporterFixtures.eventsReportDto;

      mockReportService.getEventsReport.mockResolvedValue([]);

      // Act
      const result = await controller.getEventsReport(dto);

      // Assert
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getRevenueReport', () => {
    it('should return revenue report successfully', async () => {
      // Arrange
      const dto: GetRevenueReportDto = reporterFixtures.revenueReportDto;
      const expectedResult = reporterFixtures.revenueReportResult;

      mockReportService.getRevenueReport.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getRevenueReport(dto);

      // Assert
      expect(mockReportService.getRevenueReport).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle revenue report service errors', async () => {
      // Arrange
      const dto: GetRevenueReportDto = reporterFixtures.revenueReportDto;
      const error = new Error('Revenue calculation failed');

      mockReportService.getRevenueReport.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getRevenueReport(dto)).rejects.toThrow('Revenue calculation failed');
      expect(mockReportService.getRevenueReport).toHaveBeenCalledWith(dto);
    });

    it('should return revenue data with correct structure', async () => {
      // Arrange
      const dto: GetRevenueReportDto = reporterFixtures.revenueReportDto;
      const expectedResult = reporterFixtures.revenueReportResult;

      mockReportService.getRevenueReport.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getRevenueReport(dto);

      // Assert
      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('revenueByCampaign');
      expect(typeof result.totalRevenue).toBe('number');
      expect(Array.isArray(result.revenueByCampaign)).toBe(true);
    });

    it('should handle zero revenue scenario', async () => {
      // Arrange
      const dto: GetRevenueReportDto = reporterFixtures.revenueReportDto;
      const zeroRevenueResult = {
        totalRevenue: 0,
        revenueByCampaign: [],
      };

      mockReportService.getRevenueReport.mockResolvedValue(zeroRevenueResult);

      // Act
      const result = await controller.getRevenueReport(dto);

      // Assert
      expect(result.totalRevenue).toBe(0);
      expect(result.revenueByCampaign).toEqual([]);
    });
  });

  describe('getDemographicsReport', () => {
    it('should return demographics report successfully', async () => {
      // Arrange
      const dto: GetDemographicsReportDto = reporterFixtures.demographicsReportDto;
      const expectedResult = reporterFixtures.demographicsReportResult;

      mockReportService.getDemographicsReport.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getDemographicsReport(dto);

      // Assert
      expect(mockReportService.getDemographicsReport).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle demographics report service errors', async () => {
      // Arrange
      const dto: GetDemographicsReportDto = reporterFixtures.demographicsReportDto;
      const error = new Error('User data access denied');

      mockReportService.getDemographicsReport.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getDemographicsReport(dto)).rejects.toThrow(
        'User data access denied',
      );
      expect(mockReportService.getDemographicsReport).toHaveBeenCalledWith(dto);
    });

    it('should return demographics with user data structure', async () => {
      // Arrange
      const dto: GetDemographicsReportDto = reporterFixtures.demographicsReportDto;
      const expectedResult = reporterFixtures.demographicsReportResult;

      mockReportService.getDemographicsReport.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getDemographicsReport(dto);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('sourceUserId');
        expect(typeof result[0].sourceUserId).toBe('string');
      }
    });

    it('should return empty array when no demographics found', async () => {
      // Arrange
      const dto: GetDemographicsReportDto = reporterFixtures.demographicsReportDto;

      mockReportService.getDemographicsReport.mockResolvedValue([]);

      // Act
      const result = await controller.getDemographicsReport(dto);

      // Assert
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('controller integration', () => {
    it('should handle concurrent report requests', async () => {
      // Arrange
      const eventsDto = reporterFixtures.eventsReportDto;
      const revenueDto = reporterFixtures.revenueReportDto;
      const demographicsDto = reporterFixtures.demographicsReportDto;

      mockReportService.getEventsReport.mockResolvedValue([]);
      mockReportService.getRevenueReport.mockResolvedValue(reporterFixtures.revenueReportResult);
      mockReportService.getDemographicsReport.mockResolvedValue([]);

      // Act
      const [eventsResult, revenueResult, demographicsResult] = await Promise.all([
        controller.getEventsReport(eventsDto),
        controller.getRevenueReport(revenueDto),
        controller.getDemographicsReport(demographicsDto),
      ]);

      // Assert
      expect(mockReportService.getEventsReport).toHaveBeenCalledWith(eventsDto);
      expect(mockReportService.getRevenueReport).toHaveBeenCalledWith(revenueDto);
      expect(mockReportService.getDemographicsReport).toHaveBeenCalledWith(demographicsDto);
      expect(Array.isArray(eventsResult)).toBe(true);
      expect(typeof revenueResult.totalRevenue).toBe('number');
      expect(Array.isArray(demographicsResult)).toBe(true);
    });

    it('should pass through all DTO properties correctly', async () => {
      // Arrange
      const complexEventsDto: GetEventsReportDto = {
        ...reporterFixtures.eventsReportDto,
        from: new Date('2024-01-01'),
        to: new Date('2024-12-31'),
        source: EventSource.Facebook,
        funnelStage: FunnelStage.Top,
        eventType: 'purchase',
      };

      mockReportService.getEventsReport.mockResolvedValue([]);

      // Act
      await controller.getEventsReport(complexEventsDto);

      // Assert
      expect(mockReportService.getEventsReport).toHaveBeenCalledWith(complexEventsDto);
      const passedDto = mockReportService.getEventsReport.mock.calls[0][0];
      expect(passedDto.from).toEqual(complexEventsDto.from);
      expect(passedDto.to).toEqual(complexEventsDto.to);
      expect(passedDto.source).toBe(complexEventsDto.source);
      expect(passedDto.funnelStage).toBe(complexEventsDto.funnelStage);
      expect(passedDto.eventType).toEqual(complexEventsDto.eventType);
    });
  });
});
