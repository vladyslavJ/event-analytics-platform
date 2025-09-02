import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from '../../../src/application/services/report.service';
import type { ReportGeneratorInterface } from '../../../src/domain/interfaces/report-generator.interface';
import type { ReportsMetricsServiceInterface } from 'libs/metrics/interfaces/reporter-metrics-service.interface';
import { ReporterDiTokens } from '../../../src/infrastructure/di/reporter-di-tokens';
import { MetricsDiTokens } from 'libs/metrics/di/metrics-di-tokens';
import { reporterFixtures } from '../../fixtures/reporter.fixture';

describe('ReportService', () => {
  let service: ReportService;
  let mockReportGenerator: jest.Mocked<ReportGeneratorInterface>;
  let mockMetricsService: jest.Mocked<ReportsMetricsServiceInterface>;

  beforeEach(async () => {
    const mockReportGen: jest.Mocked<ReportGeneratorInterface> = {
      generateEventsReport: jest.fn(),
      generateRevenueReport: jest.fn(),
      generateDemographicsReport: jest.fn(),
    };

    const mockMetrics: jest.Mocked<ReportsMetricsServiceInterface> = {
      observeReportLatency: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: ReporterDiTokens.REPORT_GENERATOR,
          useValue: mockReportGen,
        },
        {
          provide: MetricsDiTokens.REPORTER_METRICS_SERVICE,
          useValue: mockMetrics,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    mockReportGenerator = module.get(ReporterDiTokens.REPORT_GENERATOR);
    mockMetricsService = module.get(MetricsDiTokens.REPORTER_METRICS_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEventsReport', () => {
    it('should generate events report successfully', async () => {
      // Arrange
      const filters = reporterFixtures.eventsReportDto;
      const expectedResult = reporterFixtures.eventsReportResult;

      mockReportGenerator.generateEventsReport.mockResolvedValue(expectedResult);
      mockMetricsService.observeReportLatency.mockImplementation(
        (_type: string, fn: () => Promise<any>) => fn(),
      );

      // Act
      const result = await service.getEventsReport(filters);

      // Assert
      expect(mockMetricsService.observeReportLatency).toHaveBeenCalledWith(
        'events',
        expect.any(Function),
      );
      expect(mockReportGenerator.generateEventsReport).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });

    it('should handle events report generation errors', async () => {
      // Arrange
      const filters = reporterFixtures.eventsReportDto;
      const error = new Error('Events report generation failed');

      mockReportGenerator.generateEventsReport.mockRejectedValue(error);
      mockMetricsService.observeReportLatency.mockImplementation(
        (_type: string, fn: () => Promise<any>) => fn(),
      );

      // Act & Assert
      await expect(service.getEventsReport(filters)).rejects.toThrow(
        'Events report generation failed',
      );
      expect(mockReportGenerator.generateEventsReport).toHaveBeenCalledWith(filters);
    });

    it('should call metrics service with correct parameters', async () => {
      // Arrange
      const filters = reporterFixtures.eventsReportDto;

      mockReportGenerator.generateEventsReport.mockResolvedValue([]);
      mockMetricsService.observeReportLatency.mockImplementation(
        (_type: string, fn: () => Promise<any>) => fn(),
      );

      // Act
      await service.getEventsReport(filters);

      // Assert
      expect(mockMetricsService.observeReportLatency).toHaveBeenCalledTimes(1);
      const call = mockMetricsService.observeReportLatency.mock.calls[0];
      expect(call[0]).toBe('events');
      expect(typeof call[1]).toBe('function');
    });
  });

  describe('getRevenueReport', () => {
    it('should generate revenue report successfully', async () => {
      // Arrange
      const filters = reporterFixtures.revenueReportDto;
      const expectedResult = reporterFixtures.revenueReportResult;

      mockReportGenerator.generateRevenueReport.mockResolvedValue(expectedResult);
      mockMetricsService.observeReportLatency.mockImplementation(
        (_type: string, fn: () => Promise<any>) => fn(),
      );

      // Act
      const result = await service.getRevenueReport(filters);

      // Assert
      expect(mockMetricsService.observeReportLatency).toHaveBeenCalledWith(
        'revenue',
        expect.any(Function),
      );
      expect(mockReportGenerator.generateRevenueReport).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });

    it('should handle revenue report generation errors', async () => {
      // Arrange
      const filters = reporterFixtures.revenueReportDto;
      const error = new Error('Revenue calculation error');

      mockReportGenerator.generateRevenueReport.mockRejectedValue(error);
      mockMetricsService.observeReportLatency.mockImplementation(
        (_type: string, fn: () => Promise<any>) => fn(),
      );

      // Act & Assert
      await expect(service.getRevenueReport(filters)).rejects.toThrow('Revenue calculation error');
      expect(mockReportGenerator.generateRevenueReport).toHaveBeenCalledWith(filters);
    });

    it('should return revenue report with correct structure', async () => {
      // Arrange
      const filters = reporterFixtures.revenueReportDto;
      const expectedResult = reporterFixtures.revenueReportResult;

      mockReportGenerator.generateRevenueReport.mockResolvedValue(expectedResult);
      mockMetricsService.observeReportLatency.mockImplementation(
        (_type: string, fn: () => Promise<any>) => fn(),
      );

      // Act
      const result = await service.getRevenueReport(filters);

      // Assert
      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('revenueByCampaign');
      expect(Array.isArray(result.revenueByCampaign)).toBe(true);
      expect(typeof result.totalRevenue).toBe('number');
    });
  });

  describe('getDemographicsReport', () => {
    it('should generate demographics report successfully', async () => {
      // Arrange
      const filters = reporterFixtures.demographicsReportDto;
      const expectedResult = reporterFixtures.demographicsReportResult;

      mockReportGenerator.generateDemographicsReport.mockResolvedValue(expectedResult);
      mockMetricsService.observeReportLatency.mockImplementation(
        (_type: string, fn: () => Promise<any>) => fn(),
      );

      // Act
      const result = await service.getDemographicsReport(filters);

      // Assert
      expect(mockMetricsService.observeReportLatency).toHaveBeenCalledWith(
        'demographics',
        expect.any(Function),
      );
      expect(mockReportGenerator.generateDemographicsReport).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });

    it('should handle demographics report generation errors', async () => {
      // Arrange
      const filters = reporterFixtures.demographicsReportDto;
      const error = new Error('User data access denied');

      mockReportGenerator.generateDemographicsReport.mockRejectedValue(error);
      mockMetricsService.observeReportLatency.mockImplementation(
        (_type: string, fn: () => Promise<any>) => fn(),
      );

      // Act & Assert
      await expect(service.getDemographicsReport(filters)).rejects.toThrow(
        'User data access denied',
      );
      expect(mockReportGenerator.generateDemographicsReport).toHaveBeenCalledWith(filters);
    });

    it('should return demographics with user data structure', async () => {
      // Arrange
      const filters = reporterFixtures.demographicsReportDto;
      const expectedResult = reporterFixtures.demographicsReportResult;

      mockReportGenerator.generateDemographicsReport.mockResolvedValue(expectedResult);
      mockMetricsService.observeReportLatency.mockImplementation(
        (_type: string, fn: () => Promise<any>) => fn(),
      );

      // Act
      const result = await service.getDemographicsReport(filters);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('sourceUserId');
        expect(typeof result[0].sourceUserId).toBe('string');
      }
    });
  });

  describe('metrics integration', () => {
    it('should observe latency for all report types', async () => {
      // Arrange
      const eventsFilters = reporterFixtures.eventsReportDto;
      const revenueFilters = reporterFixtures.revenueReportDto;
      const demographicsFilters = reporterFixtures.demographicsReportDto;

      mockReportGenerator.generateEventsReport.mockResolvedValue([]);
      mockReportGenerator.generateRevenueReport.mockResolvedValue(
        reporterFixtures.revenueReportResult,
      );
      mockReportGenerator.generateDemographicsReport.mockResolvedValue([]);
      mockMetricsService.observeReportLatency.mockImplementation(
        (_type: string, fn: () => Promise<any>) => fn(),
      );

      // Act
      await service.getEventsReport(eventsFilters);
      await service.getRevenueReport(revenueFilters);
      await service.getDemographicsReport(demographicsFilters);

      // Assert
      expect(mockMetricsService.observeReportLatency).toHaveBeenCalledTimes(3);
      expect(mockMetricsService.observeReportLatency).toHaveBeenNthCalledWith(
        1,
        'events',
        expect.any(Function),
      );
      expect(mockMetricsService.observeReportLatency).toHaveBeenNthCalledWith(
        2,
        'revenue',
        expect.any(Function),
      );
      expect(mockMetricsService.observeReportLatency).toHaveBeenNthCalledWith(
        3,
        'demographics',
        expect.any(Function),
      );
    });
  });
});
