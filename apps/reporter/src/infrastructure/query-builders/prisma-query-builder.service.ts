import { Injectable, Inject } from '@nestjs/common';
import { EventSource } from 'libs/common/enums/event-source.enum';
import { QueryBuilderInterface } from '../../domain/interfaces/query-builder.interface';
import { GetEventsReportDto } from '../../dto/get-events-report.dto';
import { GetRevenueReportDto } from '../../dto/get-revenue-report.dto';
import { GetDemographicsReportDto } from '../../dto/get-demographics-report.dto';
import { FacebookBottomEvent } from 'libs/common/enums/facebook-event.enum';
import { TiktokBottomEvent } from 'libs/common/enums/tiktok-event.enum';

@Injectable()
export class PrismaQueryBuilder implements QueryBuilderInterface {
  buildEventsReportQuery(filters: GetEventsReportDto): any {
    const where: any = {
      timestamp: {
        gte: filters.from,
        lte: filters.to,
      },
      source: filters.source,
      funnelStage: filters.funnelStage,
      eventType: filters.eventType,
    };

    return {
      by: ['source', 'funnelStage', 'eventType'],
      _count: {
        id: true,
      },
      where,
    };
  }

  buildRevenueReportQuery(filters: GetRevenueReportDto): any {
    const where: any = {
      timestamp: {
        gte: filters.from,
        lte: filters.to,
      },
      source: filters.source,
      OR: [
        { eventType: FacebookBottomEvent.CheckoutComplete },
        { eventType: TiktokBottomEvent.Purchase },
      ],
      engagement: {
        campaignId: filters.campaignId,
        purchaseAmount: {
          not: null,
        },
      },
    };

    return {
      where,
      select: {
        source: true,
        engagement: {
          select: {
            campaignId: true,
            purchaseAmount: true,
          },
        },
      },
    };
  }

  buildDemographicsReportQuery(filters: GetDemographicsReportDto): any {
    const where: any = {
      source: filters.source,
      events: {
        some: {
          timestamp: {
            gte: filters.from,
            lte: filters.to,
          },
        },
      },
    };

    const facebookSelect = {
      sourceUserId: true,
      name: true,
      age: true,
      gender: true,
      country: true,
      city: true,
    };

    const tiktokSelect = {
      sourceUserId: true,
      name: true,
      followers: true,
    };

    return {
      where,
      select: filters.source === EventSource.Facebook ? facebookSelect : tiktokSelect,
    };
  }
}
