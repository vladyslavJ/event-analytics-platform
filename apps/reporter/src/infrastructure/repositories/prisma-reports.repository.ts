import { Injectable, Inject } from '@nestjs/common';
import type {
  ReportsRepositoryInterface,
  EventsReportResult,
  RevenueReportResult,
  DemographicsReportResult,
} from '../../domain/interfaces/reports-repository.interface';
import type { QueryBuilderInterface } from '../../domain/interfaces/query-builder.interface';
import { GetEventsReportDto } from '../../dto/get-events-report.dto';
import { GetRevenueReportDto } from '../../dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from '../../dto/get-demographics-report.dto';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';
import { PrismaServiceDiTokens } from 'libs/prisma-client/di/prisma-service-di-tokens';
import { ReporterDiTokens } from '../di/reporter-di-tokens';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';

@Injectable()
export class PrismaReportsRepository implements ReportsRepositoryInterface {
  constructor(
    @Inject(PrismaServiceDiTokens.PRISMA_CLIENT)
    private readonly prisma: PrismaClientService,
    @Inject(ReporterDiTokens.QUERY_BUILDER)
    private readonly queryBuilder: QueryBuilderInterface,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(PrismaReportsRepository.name);
  }

  async getEventsReport(filters: GetEventsReportDto): Promise<EventsReportResult[]> {
    const queryArgs = this.queryBuilder.buildEventsReportQuery(filters);

    try {
      const result = await this.prisma.event.groupBy(queryArgs);

      return result.map(group => ({
        source: group.source,
        funnelStage: group.funnelStage,
        eventType: group.eventType,
        count: (group._count as { id: number }).id,
      }));
    } catch (error) {
      this.logger.error(`Failed to get events report: ${error.message}`);
      throw error;
    }
  }

  async getRevenueReport(filters: GetRevenueReportDto): Promise<RevenueReportResult> {
    const queryArgs = this.queryBuilder.buildRevenueReportQuery(filters);

    try {
      const events = (await this.prisma.event.findMany(queryArgs)) as any[];

      const revenueByCampaign: Record<string, number> = {};
      let totalRevenue = 0;

      for (const event of events) {
        if (!event.engagement || !event.engagement.purchaseAmount) continue;

        const amount = Number(event.engagement.purchaseAmount);
        totalRevenue += amount;

        if (event.engagement.campaignId) {
          const campaignId = event.engagement.campaignId;
          revenueByCampaign[campaignId] = (revenueByCampaign[campaignId] || 0) + amount;
        }
      }

      return {
        totalRevenue,
        revenueByCampaign: Object.entries(revenueByCampaign).map(([campaignId, revenue]) => ({
          campaignId,
          revenue,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get revenue report: ${error.message}`);
      throw error;
    }
  }

  async getDemographicsReport(
    filters: GetDemographicsReportDto,
  ): Promise<DemographicsReportResult[]> {
    const queryArgs = this.queryBuilder.buildDemographicsReportQuery(filters);

    try {
      const users = await this.prisma.user.findMany(queryArgs);

      return users.map(user => ({
        sourceUserId: user.sourceUserId,
        name: user.name || undefined,
        age: user.age || undefined,
        gender: user.gender || undefined,
        country: user.country || undefined,
        city: user.city || undefined,
        followers: user.followers || undefined,
      }));
    } catch (error) {
      this.logger.error(`Failed to get demographics report: ${error.message}`);
      throw error;
    }
  }
}
