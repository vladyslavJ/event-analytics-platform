import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientService } from 'libs/prisma-client/src/prisma-client.service';
import { PrismaServiceDiTokens } from 'libs/prisma-client/di/prisma-service-di-tokens';
import { ReporterServiceInterface } from './interfaces/reporter-service.interface';
import { ReportsQueryBuilder } from './reports-query.builder';
import { GetEventsReportDto } from './dto/get-events-report.dto';
import { GetRevenueReportDto } from './dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from './dto/get-demographics-report.dto';
import { LoggerDiTokens } from 'libs/logger/di/logger-di-tokens';
import type { LoggerInterface } from 'libs/logger/interfaces/logger.interface';
import { ReportsMetricsService } from './metrics/reports-metrics.service';

@Injectable()
export class ReporterService implements ReporterServiceInterface {
  constructor(
    @Inject(PrismaServiceDiTokens.PRISMA_CLIENT)
    private readonly prisma: PrismaClientService,
    private readonly queryBuilder: ReportsQueryBuilder,
    private readonly metricsService: ReportsMetricsService,
    @Inject(LoggerDiTokens.LOGGER)
    private readonly logger: LoggerInterface,
  ) {
    this.logger.setContext(ReporterService.name);
  }

  async getEventsReport(filters: GetEventsReportDto): Promise<unknown> {
    this.logger.info(`Generating events report with filters: ${filters}`);
    return this.metricsService.observeReportLatency('events', async () => {
      try {
        const queryArgs: Prisma.EventGroupByArgs =
          this.queryBuilder.buildEventsReportQuery(filters);
        const result = await this.prisma.event.groupBy(queryArgs as any);
        this.logger.info(`Found ${result.length} groups for events report.`);
        return result.map(group => ({
          source: group.source,
          funnelStage: group.funnelStage,
          eventType: group.eventType,
          count: (group._count as { id: number }).id,
        }));
      } catch (error) {
        this.logger.error(`Failed to generate events report ${filters}`);
        throw error;
      }
    });
  }

  async getRevenueReport(filters: GetRevenueReportDto): Promise<unknown> {
    this.logger.info(`Generating revenue report with filters: ${filters}`);
    return this.metricsService.observeReportLatency('revenue', async () => {
      try {
        const queryArgs = {
          where: this.queryBuilder.buildRevenueReportQuery(filters).where,
          select: {
            source: true,
            engagement: {
              select: {
                campaignId: true,
                purchaseAmount: true,
              },
            },
          },
        } as const;

        type RevenueEvent = Prisma.EventGetPayload<typeof queryArgs>;
        const events: RevenueEvent[] = await this.prisma.event.findMany(queryArgs);
        this.logger.info(`Found ${events.length} events for revenue report.`);

        const revenueByCampaign: Record<string, number> = {};
        let totalRevenue = 0;

        for (const event of events) {
          if (!event.engagement || !event.engagement.purchaseAmount) continue;
          const amount = event.engagement.purchaseAmount.toNumber();
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
        this.logger.error(`Failed to generate revenue report ${filters}`);
        throw error;
      }
    });
  }

  async getDemographicsReport(filters: GetDemographicsReportDto): Promise<unknown> {
    this.logger.info(`Generating demographics report with filters: ${filters}`);
    return this.metricsService.observeReportLatency('demographics', async () => {
      try {
        const queryArgs: Prisma.UserFindManyArgs =
          this.queryBuilder.buildDemographicsReportQuery(filters);
        const users = await this.prisma.user.findMany(queryArgs);
        this.logger.info(`Found ${users.length} users for demographics report.`);
        return users;
      } catch (error) {
        this.logger.error(`Failed to generate demographics report ${filters}`);
        throw error;
      }
    });
  }
}
